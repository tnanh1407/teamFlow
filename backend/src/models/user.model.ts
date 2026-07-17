import mongoose, { Schema, type Document } from "mongoose";
import { EUserRole } from "../enums/user-role.enum.js";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  username: string;
  password: string;
  role: EUserRole;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(EUserRole),
      default: EUserRole.USER,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
