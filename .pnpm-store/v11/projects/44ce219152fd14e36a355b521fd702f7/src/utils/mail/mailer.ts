import nodemailer from "nodemailer";
import env from "../../config/env.js";

const hasSmtpConfig = !!(env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: {
        user: env.MAIL_USER!,
        pass: env.MAIL_PASS!,
      },
    })
  : null;

export const generateResetCode = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const sendResetCodeEmail = async (
  to: string,
  code: string
): Promise<void> => {
  if (!transporter) {
    console.log(`[mail-fallback] Reset code for ${to}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: {
      name: "Hệ Thống Quản Lý Phòng Ban & Dự Án",
      address: env.MAIL_FROM || env.MAIL_USER!,
    },
    to,
    subject: "Mã khôi phục mật khẩu Hệ Thống Quản Lý Phòng Ban & Dự Án",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; margin: 0 0 12px;">Khôi phục mật khẩu</h2>
        <p style="color: #374151; line-height: 1.6;">Bạn vừa yêu cầu lấy lại mật khẩu cho tài khoản Hệ Thống Quản Lý Phòng Ban & Dự Án. Mã xác nhận của bạn là:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Mã có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>
    `,
  });
};
