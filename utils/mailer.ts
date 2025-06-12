import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `<h2>Your OTP Code:</h2><p><b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`,
  });
};

export const sendResetPasswordEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code for reset",
    html: `<h2>Your OTP Code:</h2><p><b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`,
  });
};