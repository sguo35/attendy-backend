import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";

export type LoginModel = mongoose.Document & {
  email: string
};

const loginSchema = new mongoose.Schema({
  email: { type: String }
}, { timestamps: true });


// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Login = mongoose.model("Login", loginSchema);
export default Login;
