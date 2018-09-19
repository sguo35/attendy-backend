import { Request, Response } from "express";

import { default as Account } from "../models/Account";
import { default as ReportStatus } from "../models/ReportStatus";

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
        // aggregate all the queries for this user
    }, (1000 * 60 * 10));
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