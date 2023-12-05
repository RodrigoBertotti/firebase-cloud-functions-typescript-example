import {Request, Response, NextFunction} from "express";
import {verifyIdTokenInterceptor} from "./verify-idtoken-interceptor";
import bodyParser from "body-parser";


export const interceptors:Array<(req:Request,res:Response,next:NextFunction) => void> = [
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),

    // Setting default values
    (req, res, next) => {
        req.claims = {} as any;
        next();
    },
    verifyIdTokenInterceptor,
];
