import express from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';

const router = express.Router();

/**
 * Paystack Webhook Handler
 * Receives payment notifications from Paystack
 */
router.post('/webhook/paystack', express.json(), async (req, res) => {
  try {
    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Paystack webhook event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(data) {
  try {
    const { reference, amount, customer, metadata } = data;

    // Update payment status in database
    await pool.execute(
      `UPDATE payments 
       SET status = 'completed', 
           paid_at = NOW(),
           paystack_reference = $1
       WHERE reference = $2`,
      [reference, reference]
    );

    // Update registration status
    await pool.execute(
      `UPDATE registrations 
       SET status = 'active' 
       WHERE id IN (
         SELECT registration_id FROM payments WHERE reference = $1
       )`,
      [reference]
    );

    console.log(`Payment successful: ${reference}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data) {
  try {
    const { reference } = data;

    // Update payment status
    await pool.execute(
      `UPDATE payments 
       SET status = 'failed' 
       WHERE reference = $1`,
      [reference]
    );

    console.log(`Payment failed: ${reference}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

export default router;
