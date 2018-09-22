import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";

export type AttendanceEntryModel = mongoose.Document & {
  email: string,
  status: number
  // 0 = absent, -1 = tardy, 1 = present
};

const attendanceEntrySchema = new mongoose.Schema({
  email: { type: String },
  status: { type: Number }
}, { timestamps: true });


// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const AttendanceEntry = mongoose.model("AttendanceEntry", attendanceEntrySchema);
export default AttendanceEntry;
