import { TeamcityProject } from '../models/TeamcityProject';
import { TeamcityDeveloper } from '../models/TeamcityDeveloper';
import { TeamcityBuild } from '../models/TeamcityBuild';
import { TeamCityServer, TeamCitySettings } from '../Settings';
import { wrapRestCall, ILogger, IWatchdogKicker } from 'dmdashboard-core';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as nodeRestClient from 'node-rest-client';
import { AutoMapper } from '../util/AutoMapper';
import { TeamcityDeveloperCollection } from '../data-access/TeamcityDeveloperCollection';

const timeBetweenFullSyncs = 60;
let request_args = {
    headers: {
        'Accept': 'application/json'
    }
};

export class BuildFetcher {
    private requestInProgress: boolean;
    private lastSettings: TeamCitySettings;

    constructor(private logger: ILogger, private watchdogKicker: IWatchdogKicker) {

    }

    private timeSinceLastSync(server, area) {
        if (server && server.lastFullSync && server.lastFullSync[area]) {
            return moment().diff(server.lastFullSync[area], 'minutes');
        }
        return timeBetweenFullSyncs;
    }

    private getAllProjects() {

    }

    private getLatestBuilds() {

    }

    private getExistingDeveloper(id): Promise<TeamcityDeveloper> {
        return Promise.resolve(null);
    }

    private saveUser(userDetails : TeamcityDeveloper, server : TeamCityServer, existingUser : TeamcityDeveloper) {
        var user = existingUser ? existingUser : new TeamcityDeveloper();
        this.logger.debug((existingUser ? 'Force refreshing developer: ' : 'New developer found: ') + userDetails.username);
        AutoMapper.map('restdeveloper', 'mongodeveloper', userDetails, user);
        user.linkSlave = false;
        user.server = {
            name: server.name,
            url: server.url
        };
        user.save();
    }

    private processUsers(userList, server, forceRefresh) {
        var users = userList.user;
        return users.map(user => {
            return this.getExistingDeveloper(user.id)
                .then(userExists => {
                    if (forceRefresh || !userExists) {
                        return server.rest_generic_get(server.url + user.href, request_args)
                            .then(user => this.saveUser(user, server, userExists))
                            .catch(error => this.logger.error(`Could not get user for [${user.href}]`, error))
                    }
                })
                .then(result => {
                    if (!server.lastFullSync) {
                        server.lastFullSync = {};
                    }
                    server.lastFullSync.developers = moment();
                    return result;
                });
        });
    }

    private getAllUsers(server: TeamCityServer) {
        this.logger.debug('Checking for new TeamCity users');
        var doFullSync = this.timeSinceLastSync(server, 'developers') >= timeBetweenFullSyncs;
        return server.getUsers(request_args)
            .then(users => this.processUsers(users, server, doFullSync))
            .then(() => server)
            .catch(error => this.logger.error("Could not get users", error));
    }

    private refreshForServer(server: TeamCityServer): Promise<TeamcityBuild[]> {
        this.logger.debug(`Refreshing for ${server.name}`);
        return this.getAllUsers(server)
            .then(this.getAllProjects)
            .then(this.getLatestBuilds);
    }

    private refreshServers(settings: TeamCitySettings): TeamCityServer[] {
        if (settings === null) {
            throw new Error('Plugin load error - missing settings [teamcity]');
        }
        if (!_.isEqual(this.lastSettings, settings)) {
            this.logger.debug('Settings changed, recreating client');
            settings.servers = settings.servers.map(server => {
                let client = new nodeRestClient.Client({ user: server.username, password: server.password });
                server.client = client;
                server.getUsers = wrapRestCall<TeamcityDeveloper[]>(client, 'users', server.url + '/httpAuth/app/rest/users', 'GET');
                server.getProjects = wrapRestCall<TeamcityProject[]>(client, 'projects', server.url + '/httpAuth/app/rest/projects', 'GET');
                server.getBuilds = wrapRestCall<TeamcityBuild[]>(client, 'builds', server.url + '/httpAuth/app/rest/builds', 'GET');
                server.get = wrapRestCall<any>(client.get);
                return server;
            });
            this.lastSettings = settings;
        }
        return this.lastSettings.servers;
    }

    refresh(settings: TeamCitySettings) {
        if (this.requestInProgress) {
            return;
        }
        this.requestInProgress = true;
        this.logger.debug('Refreshing TeamCity builds');
        this.watchdogKicker();

        Promise.all(this.refreshServers(settings).map(server => this.refreshForServer(server)))
            .then(builds => {
                this.logger.debug(builds.toString());
            })
    }
}