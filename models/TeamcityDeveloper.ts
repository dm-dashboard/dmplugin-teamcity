import { IMongoDocument } from '../data-access/IMongoCollection';
import { ObjectID } from "mongodb";
export class TeamcityDeveloper implements IMongoDocument {
    _id : ObjectID;
    id: number;
    username: string;
    href: string;
    email: string;
    fixedSomeoneElsesBuildCount: number;
    linkSlave: boolean;
    server: {
        name: string;
        url: string;
    }
}