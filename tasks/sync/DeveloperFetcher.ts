import * as moment from 'moment';
import * as _ from 'lodash';
import * as nodeRestClient from 'node-rest-client';

import { wrapRestCall, ILogger, MongoConnection } from 'dmdashboard-core';

import { IMongoCollection } from '../../data-access/IMongoCollection';
import { TeamcityDeveloperCollection } from '../../data-access/TeamcityDeveloperCollection';

import { TeamcityDeveloper } from '../../models/TeamcityDeveloper';

import { TeamCityServer } from '../../Settings';
import { AutoMapper } from '../../util/AutoMapper';

const timeBetweenFullSyncs = 60;
let request_args = {
    headers: {
        'Accept': 'application/json'
    }
};

export class DeveloperFetcher {
    private requestInProgress: boolean;
    private developerCollection : TeamcityDeveloperCollection;

    constructor(private logger: ILogger, private mongo : MongoConnection) {
        this.developerCollection = new TeamcityDeveloperCollection(this.mongo.getCollection("teamcity_developers"));
    }

    private timeSinceLastSync(server, area) {
        if (server && server.lastFullSync && server.lastFullSync[area]) {
            return moment().diff(server.lastFullSync[area], 'minutes');
        }
        return timeBetweenFullSyncs;
    }

    private getExistingDeveloper(id): Promise<TeamcityDeveloper> {
        return this.developerCollection.getById(id);
    }

    private saveUser(userDetails : TeamcityDeveloper, server : TeamCityServer, existingUser : TeamcityDeveloper) : Promise<TeamcityDeveloper> {
        var user = existingUser ? existingUser : new TeamcityDeveloper();
        this.logger.debug((existingUser ? 'Force refreshing developer: ' : 'New developer found: ') + userDetails.username);
        AutoMapper.map('restdeveloper', 'mongodeveloper', userDetails, user);
        user.linkSlave = false;
        user.server = {
            name: server.name,
            url: server.url
        };
        return this.developerCollection.saveOrCreate(user);
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

    private getAllUsers(server: TeamCityServer) : Promise<TeamcityDeveloper[]> {
        this.logger.debug('Checking for new TeamCity users');
        var doFullSync = this.timeSinceLastSync(server, 'developers') >= timeBetweenFullSyncs;
        return server.getUsers(request_args)
            .then(users => this.processUsers(users, server, doFullSync))
            .then(() => server)
            .catch(error => this.logger.error("Could not get users", error));
    }

    refresh(server: TeamCityServer) : Promise<TeamcityDeveloper[]> {
        this.logger.debug('Refreshing TeamCity Developers');
        return this.getAllUsers(server);        
    }
}