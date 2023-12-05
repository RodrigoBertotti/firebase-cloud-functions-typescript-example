import {Controller, HttpServer} from "../index";
import {RequestHandler} from "express";
import {accountsService} from "../../../core/services/accounts-service";
import {UserClientModel} from "../../../core/data/models/user/client/user-client-model";
import {HttpResponseError} from "../../../core/utils/http-response-error";
import {environment} from "../../../environment";


export class AccountController implements Controller {

    initialize(httpServer: HttpServer): void {
        httpServer.post ('/account', this.createAccount.bind(this));
    }

    private readonly createAccount: RequestHandler = async (req, res, next,) => {
        const input: UserClientModel & { password: string, adminKey?: string } = UserClientModel.fromBody(req.body);
        if (input.role == "admin" && !environment.createAccount.adminKeys.includes(input.adminKey)) {
            throw new HttpResponseError(401, "INVALID_ADMIN_KEY", "Please, pass a valid 'adminKey' on body");
        }
        const refreshedUser = await accountsService.createAccount(input, input.password);

        res.send({
            "user": UserClientModel.fromEntity(refreshedUser).toBody(),
        });
        next();
    }
}

