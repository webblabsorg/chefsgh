/**
 * Email Notification System for Chefs Association of Ghana
 * Uses DirectAdmin's built-in email features via PHP mail() or SMTP
 */

export interface RegistrationEmailData {
  membershipId: string;
  membershipType: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  idType: string;
  idNumber: string;
  streetAddress: string;
  city: string;
  region: string;
  professionalInfo?: any;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  paymentAmount: number;
  paymentReference: string;
  registrationDate: string;
}

/**
 * Formats the registration data into a readable email body
 */
export const formatRegistrationEmail = (data: RegistrationEmailData): string => {
  const fullName = `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`;
  
  let professionalDetails = '';
  if (data.professionalInfo) {
    const info = data.professionalInfo;
    
    // Professional Member
    if (info.current_position) {
      professionalDetails = `
<h3 style="color: #0d9488; margin-top: 20px;">Professional Details</h3>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Position:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.current_position}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Employer:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.current_employer}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Experience:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.years_of_experience} years</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Specialization:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${Array.isArray(info.culinary_specialization) ? info.culinary_specialization.join(', ') : info.culinary_specialization}</td>
  </tr>
</table>`;
    }
    
    // Student Member
    if (info.institution_name) {
      professionalDetails = `
<h3 style="color: #0d9488; margin-top: 20px;">Student Details</h3>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Institution:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.institution_name}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Program:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.program}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Expected Graduation:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.expected_graduation}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Student ID:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.student_id_number}</td>
  </tr>
</table>`;
    }
    
    // Corporate Member
    if (info.business_name) {
      professionalDetails = `
<h3 style="color: #0d9488; margin-top: 20px;">Business Details</h3>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Business Name:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.business_name}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Business Type:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.business_type}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Registration Number:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.registration_number}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Employees:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.number_of_employees}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Years in Operation:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.years_in_operation}</td>
  </tr>
</table>`;
    }
    
    // Vendor Member
    if (info.company_name) {
      professionalDetails = `
<h3 style="color: #0d9488; margin-top: 20px;">Vendor Details</h3>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Company Name:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.company_name}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Products/Services:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.products_services}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Registration Number:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.registration_number}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Years in Business:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.years_in_business}</td>
  </tr>
</table>`;
    }
    
    // Associate Member
    if (info.occupation) {
      professionalDetails = `
<h3 style="color: #0d9488; margin-top: 20px;">Associate Details</h3>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Occupation:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.occupation}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Areas of Interest:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${Array.isArray(info.areas_of_interest) ? info.areas_of_interest.join(', ') : info.areas_of_interest}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Reason for Joining:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${info.reason_for_joining}</td>
  </tr>
</table>`;
    }
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Member Registration</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Member Registration</h1>
    <p style="color: #e0f2f1; margin: 10px 0 0 0;">Chefs Association of Ghana</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #475569;">A new member has successfully registered and completed payment. Please review the details below:</p>
    
    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #0d9488; margin-top: 0;">Membership Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Membership ID:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #0d9488; font-weight: bold;">${data.membershipId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Membership Type:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.membershipType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Registration Date:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.registrationDate}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #0d9488; margin-top: 30px;">Personal Information</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Full Name:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${fullName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${data.email}" style="color: #0d9488;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Phone:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="tel:${data.phoneNumber}" style="color: #0d9488;">${data.phoneNumber}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Date of Birth:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.dateOfBirth}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Gender:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.gender}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Nationality:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.nationality}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>ID Type:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.idType}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>ID Number:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.idNumber}</td>
      </tr>
    </table>

    <h3 style="color: #0d9488; margin-top: 20px;">Address</h3>
    <p style="padding: 10px; background: #f8fafc; border-radius: 5px;">
      ${data.streetAddress}<br>
      ${data.city}, ${data.region}
    </p>

    ${professionalDetails}

    <h3 style="color: #0d9488; margin-top: 20px;">Emergency Contact</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.emergencyContact.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Relationship:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.emergencyContact.relationship}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Phone:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="tel:${data.emergencyContact.phone}" style="color: #0d9488;">${data.emergencyContact.phone}</a></td>
      </tr>
    </table>

    <h3 style="color: #0d9488; margin-top: 20px;">Payment Information</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Amount Paid:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #059669; font-weight: bold;">GH₵${data.paymentAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Payment Reference:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.paymentReference}</td>
      </tr>
    </table>

    <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px;">
      <p style="margin: 0; color: #92400e;"><strong>⚠️ Action Required:</strong> Please review this registration and update the member's status in the admin panel if necessary.</p>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #64748b; font-size: 14px;">
    <p style="margin: 5px 0;">Chefs Association of Ghana</p>
    <p style="margin: 5px 0;">Email: info@chefsghana.com | Phone: +233 24 493 5185 / +233 24 277 7111</p>
    <p style="margin: 5px 0;">Website: <a href="https://chefsghana.com" style="color: #0d9488;">www.chefsghana.com</a></p>
    <p style="margin: 15px 0 5px 0; font-size: 12px; color: #94a3b8;">This is an automated notification. Please do not reply to this email.</p>
  </div>
</body>
</html>
  `;
};

/**
 * Sends email notification to admin
 * This function should be called from your backend/serverless function
 */
export const sendRegistrationNotification = async (data: RegistrationEmailData): Promise<boolean> => {
  try {
    const emailBody = formatRegistrationEmail(data);
    const subject = `🎉 New ${data.membershipType} Registration - ${data.firstName} ${data.lastName}`;
    
    // This would typically be handled by your backend API
    // For DirectAdmin, you can use PHP mail() function or configure SMTP
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: import.meta.env.VITE_ADMIN_EMAIL || 'info@chefsghana.com',
        subject,
        html: emailBody,
        from: 'info@chefsghana.com',
        fromName: 'Chefs Association of Ghana - Registration System',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send registration notification:', error);
    return false;
  }
};
