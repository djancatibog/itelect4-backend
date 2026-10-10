import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserDoc } from "../types/index";

const userSchema = new Schema<UserDoc>(
  {
    name:  { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "security_admin"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },

    // select: false hides the password from every query unless a query
    // asks for it by name (login does this later).
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true },
);

// Runs before every save. Swaps the plain password for its hash,
// so the real password is never what gets stored.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Mongo's field is _id. Your frontend reads .id, so rename it on the
// way out, and never send the password or __v.
userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = model<UserDoc>("User", userSchema);