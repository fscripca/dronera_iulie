import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendBlast() {
  try {
    const { data: users } = await supabase.from('users').select('email');
    for (const user of users) {
      try {
        await transporter.sendMail({
          from: 'Dronera <noreply@dronera.eu>',
          to: user.email,
          subject: '🚀 Big News from Dronera',
          text: 'We are excited to announce Phase 2 is live!'
        });
        console.log(`✅ Sent email to ${user.email}`);
      } catch (emailErr) {
        console.error(`❌ Failed to send email to ${user.email}:`, emailErr);
      }
    }
  } catch (err) {
    console.error('Error in sendBlast:', err);
  }
}

sendBlast();
