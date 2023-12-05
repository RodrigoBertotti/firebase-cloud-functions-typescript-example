import {User} from "../../../user";
import {firestore} from "firebase-admin";
import DocumentData = firestore.DocumentData;
import Timestamp = firestore.Timestamp;

export class UserFirestoreModel extends User {
    static kUid = 'uid';
    static kName = 'name';
    static kRole = 'role';
    static kEmail = 'email';
    static kBirthDate = 'birthDate';

    static fromEntity(entity: User): UserFirestoreModel {
        return Object.assign(UserFirestoreModel.empty(), entity);
    }

    static empty() : UserFirestoreModel {
        return new UserFirestoreModel('','','' as any,'', new Date());
    }

    static fromDocumentData(data: DocumentData): UserFirestoreModel {
        return new UserFirestoreModel(
            data[UserFirestoreModel.kUid],
            data[UserFirestoreModel.kName],
            data[UserFirestoreModel.kRole],
            data[UserFirestoreModel.kEmail],
            (data[UserFirestoreModel.kBirthDate] as Timestamp).toDate(),
        );
    }

    toDocumentData() {
        return {
            [UserFirestoreModel.kUid]: this.uid,
            [UserFirestoreModel.kName]: this.name,
            [UserFirestoreModel.kRole]: this.role,
            [UserFirestoreModel.kEmail]: this.email,
            [UserFirestoreModel.kBirthDate]: this.birthDate,
        };
    }

}
