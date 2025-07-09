const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping email send.');
      console.warn('To enable email notifications, set EMAIL_USER and EMAIL_PASS in your .env file');
      return; // Don't throw error, just skip email sending
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"TogetherCare Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    // Don't throw error - email is optional, not critical for core functionality
    console.warn('Email sending failed, but operation continues...');
  }
};

module.exports = sendEmail;
