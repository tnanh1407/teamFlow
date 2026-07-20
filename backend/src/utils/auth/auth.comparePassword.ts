import bcrypt from "bcryptjs";

export function comparePassword(plainPassword : string , hashedPassword : string) : Promise<boolean> {
  return bcrypt.compare(plainPassword , hashedPassword);
}