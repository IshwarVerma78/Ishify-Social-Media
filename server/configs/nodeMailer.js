import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
//   secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send an email using async/await
const sendEmail = async () => {
  const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    // text: "Hello world?", // Plain-text version of the message
    html: body, // HTML version of the message
  });

  return response

};

export default sendEmail