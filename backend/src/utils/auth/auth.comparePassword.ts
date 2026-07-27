import bcrypt from "bcryptjs";

export function comparePassword(plainPassword: string, storedPassword: string): Promise<boolean> {
  // In mock mode, support plaintext passwords for easy login
  if (!storedPassword.startsWith("$2")) {
    return Promise.resolve(plainPassword === storedPassword);
  }
  return bcrypt.compare(plainPassword, storedPassword);
}
