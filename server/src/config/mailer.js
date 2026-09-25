import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendVerificationEmail = async ({ email, name, token }) => {
  const verificationUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')}/verify-email/${token}`
  await transporter.sendMail({
    from: `TaskFlow <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your TaskFlow email',
    text: `Hi ${name}, verify your TaskFlow account here: ${verificationUrl}. This link expires in one hour.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033"><h1 style="color:#4f46e5">Welcome to TaskFlow</h1><p>Hi ${name},</p><p>Confirm your email address to start using your workspace.</p><p><a href="${verificationUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Verify email</a></p><p style="color:#64748b;font-size:13px">This link expires in one hour. If you did not create this account, you can ignore this email.</p></div>`,
  })
}
