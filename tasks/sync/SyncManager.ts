import { TeamcityDeveloperCollection } from '../../data-access/TeamcityDeveloperCollection';
import { TeamcityBuild } from '../../models/TeamcityBuild';
import { TeamcityProject } from '../../models/TeamcityProject';
import { DeveloperFetcher } from './DeveloperFetcher';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as nodeRestClient from 'node-rest-client';

import { wrapRestCall, ILogger, IWatchdogKicker, MongoConnection } from 'dm-dashboard-core';

import { ITeamCityServer, ITeamCitySettings } from '../../Settings';
import { AutoMapper } from '../../util/AutoMapper';
import { TeamcityDeveloper } from "../../models/TeamcityDeveloper";

export class SyncManager {
    private requestInProgress: boolean;
    private lastSettings: ITeamCitySettings;

    private developerFetcher: DeveloperFetcher;

    constructor(private logger: ILogger, private watchdogKicker: IWatchdogKicker, private mongo: MongoConnection) {
        this.developerFetcher = new DeveloperFetcher(logger, new TeamcityDeveloperCollection(this.mongo.getCollection("teamcity_developers")));
    }

    private getAllProjects(server: ITeamCityServer) : Promise<TeamcityProject[]> {
        return Promise.resolve([]);
    }

    private getNewBuilds(server: ITeamCityServer) : Promise<TeamcityBuild[]> {
        return Promise.resolve([]);
    }

    private getAllUsers(server: ITeamCityServer) : Promise<TeamcityDeveloper[]> {
        return this.developerFetcher.refresh(server);
    }

    private refreshForServer(server: ITeamCityServer): Promise<TeamcityBuild[]> {
        this.logger.debug(`Refreshing for ${server.name}`);
        return this.getAllUsers(server)
            .then(() => this.getAllProjects(server))
            .then(() => this.getNewBuilds(server));
    }

    private refreshServers(settings: ITeamCitySettings): ITeamCityServer[] {
        if (settings === null) {
            throw new Error('Plugin load error - missing settings [teamcity]');
        }
        if (!_.isEqual(this.lastSettings, settings)) {
            this.logger.debug('Settings changed, recreating client');
            settings.servers = settings.servers.map(server => {
                let client = new nodeRestClient.Client({ user: server.username, password: server.password });
                server.client = client;
                server.getUsers = wrapRestCall<{user : TeamcityDeveloper[]}>(client, 'users', server.url + '/httpAuth/app/rest/users', 'GET');
                server.getProjects = wrapRestCall<TeamcityProject[]>(client, 'projects', server.url + '/httpAuth/app/rest/projects', 'GET');
                server.getBuilds = wrapRestCall<TeamcityBuild[]>(client, 'builds', server.url + '/httpAuth/app/rest/builds', 'GET');
                server.get = wrapRestCall<any>(client.get);
                return server;
            });
            this.lastSettings = settings;
        }
        return this.lastSettings.servers;
    }

    refresh(settings: ITeamCitySettings) {
        if (this.requestInProgress) {
            return;
        }
        this.requestInProgress = true;
        this.logger.debug('Syncing Teamcity Data');
        this.watchdogKicker();

        Promise.all(this.refreshServers(settings).map(server => this.refreshForServer(server)));
    }
}