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

export const sendPasswordResetRequestReceivedEmail = async (to: string): Promise<void> => {
  if (!transporter) {
    console.log(`[mail-fallback] Password reset request received for ${to}`);
    return;
  }

  await transporter.sendMail({
    from: { name: "TeamFlow", address: env.MAIL_FROM || env.MAIL_USER! },
    to,
    subject: "Đã tiếp nhận yêu cầu cấp lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2>Đã tiếp nhận yêu cầu</h2>
        <p>Yêu cầu cấp lại mật khẩu của bạn đã được ghi nhận và đang chờ Admin xử lý.</p>
        <p>Vui lòng chờ tối đa 24 giờ và kiểm tra hộp thư để nhận thông tin đăng nhập mới.</p>
      </div>
    `,
  });
};

export const sendTemporaryPasswordEmail = async (
  to: string,
  username: string,
  temporaryPassword: string,
): Promise<void> => {
  if (!transporter) {
    console.log(`[mail-fallback] Temporary password for ${to}: ${temporaryPassword}`);
    return;
  }

  const loginUrl = `${env.APP_URL.replace(/\/$/, "")}/login`;

  await transporter.sendMail({
    from: { name: "TeamFlow", address: env.MAIL_FROM || env.MAIL_USER! },
    to,
    subject: "Mật khẩu mới cho tài khoản TeamFlow",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2>Yêu cầu cấp lại mật khẩu đã được duyệt</h2>
        <p>Tài khoản: <strong>${username}</strong></p>
        <p>Mật khẩu mới:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
          ${temporaryPassword}
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px;">Đăng nhập hệ thống</a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">Hoặc truy cập: <a href="${loginUrl}">${loginUrl}</a></p>
        <p>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi truy cập hệ thống.</p>
      </div>
    `,
  });
};
