import { Request, Response } from "express";

import { default as Account, AccountModel } from "../models/Account";
import { default as ReportStatus } from "../models/ReportStatus";
import { default as AttendanceEntry, AttendanceEntryModel } from "../models/AttendanceEntry";
import { default as Login, LoginModel } from "../models/Login";

interface LoginRequest extends Request {
    body: {
        email: string;
        fullName: string;
    };
}

let hasLogged = false;
export const login = async (req: LoginRequest, res: Response) => {
    const currentTime = new Date();
    // TODO: change in production
    if (currentTime.getDay() != 0) {
        res.status(403).end();
        return;
    }

    // Gwynevere email
    if (!hasLogged) {
        hasLogged = true;
        setTimeout(async () => {
            await sendDailyEmail();
        }, 1000 * 60 * 2);
    }

    const login = await Login.findOne({
        email: req.body.email,
        createdAt: {
            $gt: new Date(Date.now() - 1000)
        }
    });

    if (login) {
        res.status(403).end();
        return;
    } else {
        await Login.create({
            email: req.body.email
        });
    }
    const account = await Account.findOne({
        email: req.body.email,
        fullName: req.body.fullName
    });

    if (account) {
        res.status(200).end();
    } else {
        // make a new account for the user
        await Account.create({
            email: req.body.email,
            fullName: req.body.fullName
        });
        res.status(200).end();
    }

    const email = req.body.email;

    const asyncCall = async () => {
        // aggregate all the queries for this user after 140mins
        console.log(email);
        await aggregateReports(email);
    };

    setTimeout(asyncCall, (1000 * 60));
};

/**
 * Aggregates the reports for the user with `email`
 * @param {String} email email to aggregate reports for
 */
const aggregateReports = async (email: string) => {
    console.log(`Aggregating reports for ${email} at ${new Date()}`);
    const gt = new Date(Date.now() - 1000 * 60 * 10);
    const lte = new Date(Date.now());
    const beforeReports = await ReportStatus.find({
        email: email,
        "createdAt": {
            $gt: gt,
            $lt: lte
        }
    });

    const afterReports = await ReportStatus.find({
        email: email,
        "createdAt": {
            $gt: new Date(Date.now() - 1000 * 60 * 30),
        }
    });

    if (beforeReports.length > 1 && afterReports.length > 1) {
        // they were there
        await AttendanceEntry.create({
            email: email,
            status: 1
        });
    } else if (afterReports.length > 1) {
        await AttendanceEntry.create({
            email: email,
            status: -1
        });
    } else {
        await AttendanceEntry.create({
            email: email,
            status: 0
        });
    }
};

import { transporter } from "./mailer";
import csv from "csv";

export const sendDailyEmail = async () => {
    hasLogged = false;

    const accounts = await Account.find().sort({ fullName: "asc" });

    const outArr = [];
    const titleArr = ["email", "full name"];
    let refDate = new Date("9/27/18");
    for (let i = 0; i < 10; i++) {
        titleArr.push(`${refDate.getMonth()}/${refDate.getDate()}/${refDate.getFullYear()}`);
        refDate = new Date(refDate.getTime() + 1000 * 60 * 60 * 24 * 7);
    }
    outArr.push(titleArr);
    for (let i = 0; i < accounts.length; i++) {
        const account = <AccountModel> accounts[i];

        const attendanceEntries = await AttendanceEntry.find({
            email: account.email
        }).sort({ createdAt: "asc"});

        const newRow = [];
        newRow.push(account.email);
        newRow.push(account.fullName);
        for (let j = 0; j < attendanceEntries.length; j++) {
            const entry = <AttendanceEntryModel> attendanceEntries[j];
            let append = undefined;
            if (entry.status == 1) {
                append = "present";
            } else if (entry.status == -1) {
                append = "tardy";
            } else {
                append = "absent";
            }
            newRow.push(append);
        }
        outArr.push(newRow);
    }

    const csvString = csv.stringify(outArr);

    const mailOptions = {
        attachments: [
            {
                filename: "cumulative attendance.csv",
                content: csvString
            }
        ],
        from: "ugba196.mailer@gmail.com",
        to: "shiyuan.guo@berkeley.edu",
        subject: `Attendance for ${(new Date()).getMonth()}/${(new Date()).getDate()}/${(new Date()).getFullYear()}`,
        text: "Dear Gwynevere,\nThe attendance for today can be found below."
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log(info);
    });
};

interface ReportStatus extends Request {
    body: {
        email: string;
        detectedEmail: Array<string>;
    };
}
export const reportStatus = async (req: ReportStatus, res: Response) => {
    await ReportStatus.create({
        email: req.body.detectedEmail,
        reporter: req.body.email
    });
    res.status(200).end();
};

// export const aggregateResults = null;