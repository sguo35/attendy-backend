import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";

export type ReportStatusModel = mongoose.Document & {
  email: string,
  reporter: string
};

const reportStatusSchema = new mongoose.Schema({
  email: { type: String },
  reporter: {
    type: String
  }
}, { timestamps: true });


// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const ReportStatus = mongoose.model("ReportStatus", reportStatusSchema);
export default ReportStatus;
