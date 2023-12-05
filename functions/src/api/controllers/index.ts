import {Express, NextFunction, Request, RequestHandler, Response} from "express";
import {MyClaims} from "../../index";
import {ErrorResponseBody, HttpResponseError} from "../../core/utils/http-response-error";
import {logger} from "firebase-functions";

export interface Controller {
    initialize(httpServer: HttpServer): void;
}

export class HttpServer {

    constructor(public readonly express:Express,) {}

    get(path: string, requestHandler: RequestHandler, claims?:MyClaims[]): void {
        this.express.get(path,this._catchErrorHandler(requestHandler, claims));
    }

    post(path: string, requestHandler: RequestHandler, claims?:MyClaims[]): void {
        this.express.post(path,this._catchErrorHandler(requestHandler, claims));
    }

    delete(path: string, requestHandler: RequestHandler, claims?:MyClaims[]): void {
        this.express.delete(path,this._catchErrorHandler(requestHandler, claims));
    }

    put(path: string, requestHandler: RequestHandler, claims?:MyClaims[]): void {
        this.express.put(path,this._catchErrorHandler(requestHandler, claims));
    }

    private readonly _catchErrorHandler =  (requestHandler: RequestHandler, claims?:MyClaims[]) => {
        return async (req:Request, res:Response, next:NextFunction) => {
            const checkClaims = () => {
                if(claims?.length) {
                    for(let claim of claims){
                        if((req.auth?.customClaims ?? {})[claim]){
                            return;
                        }
                        if ((req.claims ?? {})[claim]) {
                            return;
                        }
                    }
                    throw new HttpResponseError(403, 'FORBIDDEN', !req.auth ? `Requires authentication` :`Only ${claims.toString().replace(/,/g, ', ')} can perform this operation`);
                }
            };
            try {
                checkClaims();
                // noinspection ES6RedundantAwait
                await Promise.resolve(requestHandler(req,res,next));
            } catch (e){
                const userInfo = !req.auth?.uid?.length ? '' : ` uid: ${req.auth.uid}`;

                if(e instanceof HttpResponseError){
                    const errorMessage = `[${req.method.toUpperCase()}] ${req.path}${userInfo}`;
                    if (e.status >= 500) {
                        logger.error(errorMessage);
                    } else {
                        logger.warn(errorMessage);
                    }

                    res.statusCode = e.status;
                    res.send(
                        new ErrorResponseBody({
                            status: e.status,
                            code: e.code,
                            description: e.description,
                        })
                    );
                    next();
                    return;
                }

                logger.error(`[${req.method.toUpperCase()}] ${req.path}${userInfo}`);
                logger.error(e.stack);
                res.statusCode = 500;
                res.send(
                    new ErrorResponseBody({
                        status: 500,
                        code: 'INTERNAL_ERROR',
                        description: 'An internal error occurred, please contact support',
                    })
                );
                next();
            }
        };
    };
}
