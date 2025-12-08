const nodemailer = require("nodemailer");

module.exports = async (to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // console.log("------------------------------------------");
  // console.log(`Sending Email to: ${to}`);
  // console.log(`Subject: ${subject}`);
  // console.log(message); // Log the HTML message (contains OTP)
  // console.log("------------------------------------------");

  try {
    return await transporter.sendMail({
      from: "Job Tracker App",
      to,
      subject,
      html: message,
    });
  } catch (error) {
    console.error("Failed to send email via SMTP (Mocking success for dev):", error.message);
    return; // Don't throw, allowing flow to continue
  }
};