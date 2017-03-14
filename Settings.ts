import { TeamcityProject } from './models/TeamcityProject';
import { TeamcityDeveloper } from './models/TeamcityDeveloper';
import * as nodeRestClient from 'node-rest-client';
import { TeamcityBuild } from "./models/TeamcityBuild";

export interface TeamCityServer {
    name : string;
    active : boolean;
    username : string;
    password : string;
    url : string;
    getUsers : ({}) => Promise<TeamcityDeveloper[]>;
    getBuilds : ({}) => Promise<TeamcityBuild[]>;
    getProjects : ({}) => Promise<TeamcityProject[]>;
    get : () => Promise<any>;
    client : nodeRestClient.Client;
}

export interface TeamCitySettings {
    servers : TeamCityServer[];
}