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
};

interface ReportStatus extends Request {
    body: {
        email: string;
        detectedEmails: Array<string>;
    };
}
export const reportStatus = async (req: ReportStatus, res: Response) => {
    Promise.all(req.body.detectedEmails.map(async (email) => {
        await ReportStatus.create({
            email: email,
            reporter: req.body.email
        });
    }));
};