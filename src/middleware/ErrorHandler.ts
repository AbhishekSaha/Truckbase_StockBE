import { NextFunction, Request, Response } from "express";
import {HttpError} from "http-errors";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err.message)
    }

    if (err instanceof HttpError) {
        res.statusCode = err.statusCode;
    } else {
        res.statusCode = 500;
    }
    res.json(err.message);
};