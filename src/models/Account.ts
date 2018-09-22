import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";

export type AccountModel = mongoose.Document & {
  email: string,
  fullName: string
};

const accountSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  fullName: {
    type: String
  }
}, { timestamps: true });


// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Account = mongoose.model("Account", accountSchema);
export default Account;
