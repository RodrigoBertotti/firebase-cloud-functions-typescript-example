import {InitializeEventTriggers } from "./initialize-event-triggers";
import {ProductsEventTriggers} from "./by-document/products-event-triggers";
import {UsersEventTriggers} from "./by-document/users-event-triggers";

/** TODO: Add your v2 functions handlers here */
const eventTriggerList: Array<InitializeEventTriggers> = [
    new ProductsEventTriggers(),
    new UsersEventTriggers(),
]

export function eventTriggers (): object {
    const res: object = {};
    for (let v2 of eventTriggerList) {
        v2.initialize((params) => {
            res[params.name] = params.handler;
        });
    }
    return res;
}
