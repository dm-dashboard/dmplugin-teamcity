import { TeamcityProject } from './models/TeamcityProject';
import { TeamcityDeveloper } from './models/TeamcityDeveloper';
import * as nodeRestClient from 'node-rest-client';
import { TeamcityBuild } from "./models/TeamcityBuild";

export interface ITeamCityServer {
    name : string;
    active : boolean;
    username : string;
    password : string;
    url : string;
    getUsers : ({}) => Promise<{ user : TeamcityDeveloper[]}>;
    getBuilds : ({}) => Promise<TeamcityBuild[]>;
    getProjects : ({}) => Promise<TeamcityProject[]>;
    get : (url : string, options : {}) => Promise<any>;
    client : nodeRestClient.Client;
    lastFullSync : any;
}

export interface ITeamCitySettings {
    servers : ITeamCityServer[];
}