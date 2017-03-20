import { IMongoDocument } from '../data-access/IMongoCollection';
export class TeamcityDeveloper implements IMongoDocument {
    id: number;
    username: string;
    href: string;
    lastLogin: Date;
    email: string;
    fixedSomeoneElsesBuildCount: number;
    linkSlave: boolean;
    server: {
        name: string;
        url: string;
    }
}