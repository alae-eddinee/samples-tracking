import mongoose, { Schema, model, models } from "mongoose";
import type { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user", required: true },
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    created_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { versionKey: false }
);

const User = models.User || model<IUser>("User", UserSchema);
export default User;
