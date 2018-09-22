import { Request, Response } from "express";

import { default as Account } from "../models/Account";
import { default as ReportStatus } from "../models/ReportStatus";
import { default as AttendanceEntry } from "../models/AttendanceEntry";

interface LoginRequest extends Request {
    body: {
        email: string;
        fullName: string;
    };
}
export const login = async (req: LoginRequest, res: Response) => {
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

    setTimeout(async () => {
        // aggregate all the queries for this user after 140mins
        await aggregateReports(req.body.email);
    }, (1000 * 60 * 140));
};

/**
 * Aggregates the reports for the user with `email`
 * @param {String} email email to aggregate reports for
 */
const aggregateReports = async (email: string) => {
    const beforeReports = await ReportStatus.find({
        email: email,
        createdAt: {
            $gt: new Date(Date.now() - 1000 * 60 * 150),
            $lt: new Date(Date.now() - 1000 * 60 * 120)
        }
    });

    const afterReports = await ReportStatus.find({
        email: email,
        createdAt: {
            $gt: new Date(Date.now() - 1000 * 60 * 30),
        }
    });

    if (beforeReports.length > 5 && afterReports.length > 5) {
        // they were there
        await AttendanceEntry.create({
            email: email,
            status: 1
        });
    } else if (afterReports.length > 5) {
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