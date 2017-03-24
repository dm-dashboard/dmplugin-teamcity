import { IMongoDocument } from '../data-access/IMongoCollection';
import { ObjectID } from "mongodb";

export class TeamcityBuild implements IMongoDocument {
    _id : ObjectID;
    id: number;
    buildType: {
        id: string;
        name: string,
        description: string,
        projectName: string,
        projectId: string,
        href: string,
        webUrl: string,
        paused: boolean
    };
    number: string;
    status: string;
    state: string;
    branchName: string;
    defaultBranch: boolean;
    href: string;
    webUrl: string;
    statusText: string;
    queuedDate: Date;
    startDate: Date;
    finishDate: Date;
    triggered: {
        type: string;
        details: string,
        date: Date
    };
    changes: [{
        id: number,
        version: string,
        username: string,
        userId: number,
        date: Date,
        href: string,
        webLink: string,
        comment: string
    }];

    agent: {
        id: number,
        name: string,
        typeId: number,
        href: string
    };
    tests: {
        count: number,
        passed: number,
        detail: string
    };
    statistics: {
        location: string,
        stats: [
            {
                name: string,
                value: string
            }
        ]
    };
    // developer: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'TeamcityDeveloper'
    // };
    // project: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'TeamcityProject'
    // };
    testDetails: {
        testsRun: number,
        testsPassed: number,
        href: string,
        allPassed: boolean
    };
    canceledInfo: {
        user: {
            username: string,
            name: string,
            id: number,
            href: string
        },
        timestamp: Date
    };
    personal: boolean;
    server: {
        name: string,
        url: string
    }
}