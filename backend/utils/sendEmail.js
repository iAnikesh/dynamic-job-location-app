const nodemailer = require("nodemailer");

module.exports = async (to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter.sendMail({
    from: "Job Tracker App",
    to,
    subject,
    html: message,
  });
};