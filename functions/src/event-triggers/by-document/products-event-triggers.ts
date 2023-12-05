import {InitializeEventTriggers, EventTriggerV2Function, AddEventTrigger} from "../initialize-event-triggers";
import {ProductFirestoreModel} from "../../core/data/models/product/firestore/product-firestore-model";
import {Product} from "../../core/data/product";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import {DbChangedRecord} from "../../core/data/db-changed-record";
import {dbChangesService} from "../../core/services/db-changes-service";

export class ProductsEventTriggers implements InitializeEventTriggers {

    initialize(add: AddEventTrigger): void {
        add(this.onCreated);
        add(this.onUpdated);
    }

    private readonly onCreated: EventTriggerV2Function = {
      name: 'onProductCreated',
      handler: onDocumentCreated('products/{productId}', async (document) => {
          console.log("onProductCreated");
          const product: Product = ProductFirestoreModel.fromDocumentData(document.data.data());

          const record = new DbChangedRecord(
              'PRODUCT_CREATED',
              `Product ${product.name} has been created`,
              product.storeOwnerUid,
          );
          await dbChangesService.addRecord(record);
      }),
    };

    private readonly onUpdated: EventTriggerV2Function = {
        name: 'onProductUpdated',
        handler: onDocumentUpdated('products/{productId}', async (document) => {
            const product: Product = ProductFirestoreModel.fromDocumentData(document.data.after.data());
            const record = new DbChangedRecord(
                'PRODUCT_UPDATED',
                `Product ${product.name} has been updated`,
                product.storeOwnerUid,
            );
            await dbChangesService.addRecord(record);
        }),
    };
}
