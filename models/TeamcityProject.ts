import { TeamcityBuild } from './TeamcityBuild';

export class TeamcityProject {
    id: string;
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