import {DbChangedRecord} from "../../../db-changed-record";

export class DbChangedRecordClientModel extends DbChangedRecord {
    static kRecordId: string = 'recordId';
    static kCode: string = 'code';
    static kDescription: string = 'description';
    static kUid: string = 'uid';
    static kDateTimeMillisecondsSinceEpoch: string = 'dateTime';

    static fromEntity(entity: DbChangedRecord): DbChangedRecordClientModel {
        return Object.assign(DbChangedRecordClientModel.empty(), entity);
    }

    static empty (): DbChangedRecordClientModel {
        return new DbChangedRecordClientModel('', '', '', '', new Date());
    }

    toBody() {
        return {
            [DbChangedRecordClientModel.kRecordId]: this.recordId,
            [DbChangedRecordClientModel.kCode]: this.code,
            [DbChangedRecordClientModel.kDescription]: this.description,
            [DbChangedRecordClientModel.kUid]: this.uid,
            [DbChangedRecordClientModel.kDateTimeMillisecondsSinceEpoch]: this.dateTime.getTime(),
        };
    }
}
