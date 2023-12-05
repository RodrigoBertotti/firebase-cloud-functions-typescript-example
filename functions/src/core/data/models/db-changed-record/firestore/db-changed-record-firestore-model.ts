import {DbChangedRecord} from "../../../db-changed-record";
import {firestore} from "firebase-admin";
import Timestamp = firestore.Timestamp;
import FieldValue = firestore.FieldValue;
import DocumentData = firestore.DocumentData;

export class DbChangedRecordFirestoreModel extends DbChangedRecord {
    static kRecordId: string = 'recordId';
    static kCode: string = 'code';
    static kDescription: string = 'description';
    static kUid: string = 'uid';
    static kDateTime: string = 'dateTime';

    static fromEntity(entity: DbChangedRecord): DbChangedRecordFirestoreModel {
        return Object.assign(DbChangedRecordFirestoreModel.empty(), entity);
    }

    static empty (): DbChangedRecordFirestoreModel {
        return new DbChangedRecordFirestoreModel('', '', '');
    }

    static fromDocumentData(data: DocumentData): DbChangedRecordFirestoreModel {
        return new DbChangedRecordFirestoreModel(
            data[DbChangedRecordFirestoreModel.kCode],
            data[DbChangedRecordFirestoreModel.kDescription],
            data[DbChangedRecordFirestoreModel.kUid],
            data[DbChangedRecordFirestoreModel.kRecordId],
            (data[DbChangedRecordFirestoreModel.kDateTime] as Timestamp).toDate(),
        );
    }

    toDocumentData(dateTime: FieldValue|Date) {
        return {
            [DbChangedRecordFirestoreModel.kRecordId]: this.recordId,
            [DbChangedRecordFirestoreModel.kCode]: this.code,
            [DbChangedRecordFirestoreModel.kDescription]: this.description,
            [DbChangedRecordFirestoreModel.kUid]: this.uid,
            [DbChangedRecordFirestoreModel.kDateTime]: dateTime instanceof FieldValue ? dateTime : Timestamp.fromDate(dateTime ?? this.dateTime),
        };
    }
}
