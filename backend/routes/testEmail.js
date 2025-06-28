// routes/testEmail.js
const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

router.post('/send-test-email', async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({ message: 'Recipient email (to) is required.' });
  }

  try {
    await sendEmail({
      to,
      subject: 'TogetherCare Test Email ✉️',
      text: 'This is a test email from TogetherCare.',
      html: `<p>Hello <strong>${to}</strong>,</p>
             <p>This is a <b>test email</b> from the TogetherCare platform.</p>`
    });

    res.status(200).json({ message: 'Email sent successfully ✅' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Failed to send test email ❌' });
  }
});

module.exports = router;
