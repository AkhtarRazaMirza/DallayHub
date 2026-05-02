// import nodemailer from "nodemailer";

// SMTP transporter — works with Mailtrap, Gmail, SendGrid, or any SMTP provider
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT) || 587,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

import { Resend } from "resend";
import ApiError from "../utils/error.js";

if (!process.env.RESEND_API_KEY) {
  throw ApiError.conflict("RESEND_API_KEY is not defined");
}

if (!process.env.EMAIL_FROM || !process.env.EMAIL_FROM_NAME) {
  throw ApiError.conflict("Email sender config missing");
}

if (!process.env.CLIENT_URL) {
  throw ApiError.conflict("CLIENT_URL is not defined");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const send = async (to: string, subject: string, html: string) => {
  try {
    const response = await resend.emails.send({
      from: "AuthCore <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    // log minimal info
    console.log(`Email sent to ${to}`);
    console.log("RESEND RESPONSE:", response);

    return response;
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw ApiError.internal("Failed to send email");
  }
};

// 📩 Verification Email
const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.CLIENT_URL}/api/auth/verify-email/${token}`;

  return send(
    email,
    "Verify your email",
    `
    <h2>Welcome 👋</h2>
    <p>Please verify your email:</p>
    <a href="${url}">Verify Email</a>
    `
  );
};

// 🔐 Reset Password Email
const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${process.env.CLIENT_URL}/api/auth/reset-password/${token}`;

  return send(
    email,
    "Reset your password",
    `
    <h2>Password Reset</h2>
    <p>Click below to reset your password:</p>
    <a href="${url}">Reset Password</a>
    <p>This link expires in 15 minutes.</p>
    `
  );
};

export {
  sendVerificationEmail,
  sendResetPasswordEmail,
};