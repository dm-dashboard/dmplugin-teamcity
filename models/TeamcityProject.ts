import { IMongoDocument } from '../data-access/IMongoCollection';
import { TeamcityBuild } from './TeamcityBuild';
import { ObjectID } from "mongodb";

export class TeamcityProject implements IMongoDocument {
    id: string;
    _id : ObjectID;
    name : string;
    href : string;
    webUrl : string;
    buildTypes : [{
        id: string;
        name: string;
        projectName: string;
        projectId: string;
        href: string;
        webUrl: string;
        paused: boolean;
        "snapshot-dependencies": [{
            "source-buildType": {
                id: string;
                name: string;
                projectName: string;
                projectId: string;
                href: string;
                webUrl: string
            }
        }],
        partOfChain : {type : Boolean}
    }];
    builds: TeamcityBuild[];
    server : {
        name: {type : String},
        url: {type : String}
    }
}