import {Controller, HttpServer} from "../index";
import {RequestHandler} from "express";
import {dbChangesService} from "../../../core/services/db-changes-service";
import {
    DbChangedRecordClientModel
} from "../../../core/data/models/db-changed-record/client/db-changed-record-client-model";


// TODO: https://firebase.google.com/docs/functions/local-emulator

export class AdminController implements Controller {

    initialize(httpServer: HttpServer,): void {
        httpServer.get('/db-changes', this.getDbChanges.bind(this), ['admin']);
    }

    private readonly getDbChanges: RequestHandler = async (req, res, next,) => {
        const records = await dbChangesService.getRecords();
        const outputList = records.map(item => DbChangedRecordClientModel.fromEntity(item).toBody());
        res.send({
            "db-changes": outputList
        });
        next();
    }
}
