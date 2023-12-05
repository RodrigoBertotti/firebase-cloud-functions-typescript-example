import {AddEventTrigger, InitializeEventTriggers, EventTriggerV2Function} from "../initialize-event-triggers";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {UserFirestoreModel} from "../../core/data/models/user/firestore/user-firestore-model";
import {dbChangesService} from "../../core/services/db-changes-service";
import {DbChangedRecord} from "../../core/data/db-changed-record";


export class UsersEventTriggers implements InitializeEventTriggers {

    initialize(add: AddEventTrigger): void {
        add(this.onCreated);
    }

    private readonly onCreated: EventTriggerV2Function = {
      name: 'onUserCreated',
      handler: onDocumentCreated('users/{userId}', async (document) => {
         const user = UserFirestoreModel.fromDocumentData(document.data.data());
         const record = new DbChangedRecord(
             'USER_CREATED',
             `User ${user.name} (${user.role}) has been created`,
             user.uid,
         );
         await dbChangesService.addRecord(record);
      }),
    };

}
