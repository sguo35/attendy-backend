import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
        user: process.env.USERNAME,
        pass: process.env.PASS
    }
});