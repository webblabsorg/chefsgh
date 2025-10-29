import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getConnection } from '../db.js';
import { sendRegistrationEmail } from '../services/email.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

const upload = multer({ storage });

const buildRelativePath = (filename) => `uploads/${filename}`;

const parseJsonField = (value, fallback = {}) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse JSON field', error);
    return fallback;
  }
};

router.post('/', upload.single('profilePhoto'), async (req, res) => {
  let connection;

  try {
    const payload = parseJsonField(req.body.payload, null);

    if (!payload) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const {
      membershipTypeId,
      membershipSlug,
      personal,
      contact,
      identification,
      professional,
      emergencyContact,
      terms,
      payment,
    } = payload;

    if (!membershipTypeId || !payment?.reference || !payment?.amount) {
      return res.status(400).json({ error: 'Missing required registration details' });
    }

    connection = await getConnection();
    await connection.beginTransaction();

    const [membershipRows] = await connection.execute(
      'SELECT id, price FROM membership_types WHERE id = ? AND is_active = TRUE',
      [membershipTypeId]
    );

    if (membershipRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid membership type selected' });
    }

    const profilePhotoPath = req.file ? buildRelativePath(req.file.filename) : null;

    let userId;

    const [existingUserRows] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [contact.email]
    );

    if (existingUserRows.length > 0) {
      userId = existingUserRows[0].id;
      await connection.execute(
        `UPDATE users
         SET first_name = ?,
             middle_name = ?,
             last_name = ?,
             phone_number = ?,
             alternative_phone = ?,
             date_of_birth = ?,
             gender = ?,
             nationality = ?,
             id_type = ?,
             id_number = ?,
             street_address = ?,
             city = ?,
             region = ?,
             digital_address = ?,
             professional_info = ?,
             emergency_contact = ?,
             profile_photo_url = COALESCE(?, profile_photo_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          personal.firstName,
          personal.middleName ?? null,
          personal.lastName,
          contact.phone,
          contact.alternativePhone ?? null,
          personal.dateOfBirth,
          personal.gender,
          personal.nationality,
          identification.idType,
          identification.idNumber,
          contact.streetAddress,
          contact.city,
          contact.region,
          contact.digitalAddress ?? null,
          JSON.stringify(professional ?? {}),
          JSON.stringify(emergencyContact ?? {}),
          profilePhotoPath,
          userId,
        ]
      );
    } else {
      await connection.execute(
        `INSERT INTO users (
           first_name,
           middle_name,
           last_name,
           email,
           phone_number,
           alternative_phone,
           date_of_birth,
           gender,
           nationality,
           id_type,
           id_number,
           street_address,
           city,
           region,
           digital_address,
           professional_info,
           emergency_contact,
           profile_photo_url
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          personal.firstName,
          personal.middleName ?? null,
          personal.lastName,
          contact.email,
          contact.phone,
          contact.alternativePhone ?? null,
          personal.dateOfBirth,
          personal.gender,
          personal.nationality,
          identification.idType,
          identification.idNumber,
          contact.streetAddress,
          contact.city,
          contact.region,
          contact.digitalAddress ?? null,
          JSON.stringify(professional ?? {}),
          JSON.stringify(emergencyContact ?? {}),
          profilePhotoPath,
        ]
      );

      const [newUserRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [contact.email]
      );

      userId = newUserRows[0].id;
    }

    await connection.execute(
      `INSERT INTO payments (reference, gateway, status, amount, currency, channel, paid_at, metadata, customer_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         amount = VALUES(amount),
         paid_at = VALUES(paid_at),
         metadata = VALUES(metadata),
         customer_email = VALUES(customer_email)`,
      [
        payment.reference,
        payment.gateway ?? 'paystack',
        payment.status ?? 'success',
        payment.amount,
        payment.currency ?? 'GHS',
        payment.channel ?? null,
        payment.paidAt ?? new Date(),
        JSON.stringify({ membership_slug: membershipSlug, ...payment.metadata }),
        contact.email,
      ]
    );

    const [paymentRows] = await connection.execute(
      'SELECT id FROM payments WHERE reference = ?',
      [payment.reference]
    );

    const paymentId = paymentRows[0].id;

    const [membershipIdResult] = await connection.query('CALL generate_membership_id()');
    const generatedMembershipId = membershipIdResult[0][0].membership_id;

    const expiryDate = payment.membershipExpiry
      ? new Date(payment.membershipExpiry)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const expiryDateSql = expiryDate.toISOString().slice(0, 10);

    await connection.execute(
      `INSERT INTO registrations (
         membership_id,
         user_id,
         membership_type_id,
         payment_id,
         payment_reference,
         payment_status,
         payment_amount,
         payment_date,
         terms_accepted,
         code_of_conduct_accepted,
         data_privacy_accepted,
         membership_status,
         membership_expiry
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        generatedMembershipId,
        userId,
        membershipTypeId,
        paymentId,
        payment.reference,
        payment.status ?? 'success',
        payment.amount,
        payment.paidAt ?? new Date(),
        !!terms?.termsAccepted,
        !!terms?.codeOfConductAccepted,
        !!terms?.dataPrivacyAccepted,
        'active',
        expiryDateSql,
      ]
    );

    const [registrationRows] = await connection.execute(
      'SELECT id FROM registrations WHERE membership_id = ?',
      [generatedMembershipId]
    );

    const registrationId = registrationRows[0].id;

    if (req.file) {
      await connection.execute(
        `INSERT INTO registration_documents (
           registration_id,
           document_type,
           file_name,
           file_path,
           file_size,
           mime_type
         ) VALUES (?, 'profile_photo', ?, ?, ?, ?)` ,
        [registrationId, req.file.originalname, profilePhotoPath, req.file.size, req.file.mimetype]
      );
    }

    await connection.commit();

    try {
      await sendRegistrationEmail({
        registrationId,
        membershipId: generatedMembershipId,
        membershipType: membershipRows[0].name,
        personal,
        contact,
        identification,
        professional,
        emergencyContact,
        payment,
        profilePhotoUrl: profilePhotoPath,
      });
    } catch (emailError) {
      console.error('Failed to send notification email', emailError);
      return res.status(500).json({ error: 'Registration saved but notification email failed' });
    }

    res.status(201).json({ membershipId: generatedMembershipId, registrationId });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Failed to rollback transaction', rollbackError);
      }
    }

    console.error('Registration processing failed', error);
    res.status(500).json({ error: 'Failed to save registration' });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
