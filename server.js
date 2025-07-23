import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.API_SERVER_PORT || 3001;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, message, name, email, replyTo } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Subject and message are required' });
    }

    const recipient = to || process.env.SUPPORT_EMAIL || 'support@dronera.com';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@dronera.com';

    const mailOptions = {
      from: fromEmail,
      to: recipient,
      subject,
      replyTo: replyTo || email || fromEmail,
      text: message,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: auto;">
          <h2 style="color: #00ccff;">DRONERA Support Message</h2>
          <p><strong>From:</strong> ${name || 'Anonymous'} ${email ? `(${email})` : ''}</p>
          <div style="border-left: 4px solid #00ccff; padding-left: 15px; margin: 20px 0;">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This email was sent from the DRONERA platform.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, messageId: info.messageId, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/support-request', async (req, res) => {
  try {
    const { userEmail, subject, message, priority = 'medium' } = req.body;

    if (!subject || !message || !userEmail) {
      return res.status(400).json({ success: false, error: 'Email, subject and message are required' });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@dronera.com';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@dronera.com';

    const mailOptions = {
      from: fromEmail,
      to: supportEmail,
      subject: `Website Contact Form: ${subject}`,
      replyTo: userEmail,
      text: `Priority: ${priority.toUpperCase()}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: auto;">
          <h2 style="color: #00ccff;">DRONERA Support Request</h2>
          <p><strong>From:</strong> ${userEmail}</p>
          <p><strong>Priority:</strong> <span style="color: ${
            priority === 'high' ? '#ff3333' : priority === 'medium' ? '#ffaa33' : '#33aa33'
          }">${priority.toUpperCase()}</span></p>
          <div style="border-left: 4px solid #00ccff; padding-left: 15px; margin: 20px 0;">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This support request was sent from the DRONERA platform.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, messageId: info.messageId, message: 'Support request sent successfully' });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/create-verification-session', async (req, res) => {
  try {
    const { user_id, email } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({ success: false, error: 'User ID and email are required' });
    }

    console.log('Creating Stripe Identity session for:', email);

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { user_id },
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/kyc-callback?session_id={CHECKOUT_SESSION_ID}`,
    });

    console.log('Session created:', verificationSession.id);

    res.json({
      success: true,
      url: verificationSession.url,
      sessionId: verificationSession.id
    });
  } catch (error) {
    console.error('Stripe verification session creation failed:', error);
    if (error.raw) {
      res.status(500).json({ success: false, error: error.raw.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook verification error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'identity.verification_session.verified':
      console.log(`KYC verified for user: ${event.data.object.metadata.user_id}`);
      break;
    case 'identity.verification_session.requires_input':
      console.log(`KYC failed for user: ${event.data.object.metadata.user_id}`);
      break;
    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }

  res.json({ received: true });
});

app.get('/api/health', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ status: 'OK', smtp: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', smtp: 'disconnected', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`DRONERA API server running at http://localhost:${port}`);
});
