import * as moment from 'moment';
import * as _ from 'lodash';
import * as nodeRestClient from 'node-rest-client';

import { wrapRestCall, ILogger, MongoConnection } from 'dm-dashboard-core';

import { IMongoCollection } from '../../data-access/IMongoCollection';
import { TeamcityDeveloperCollection } from '../../data-access/TeamcityDeveloperCollection';

import { TeamcityDeveloper } from '../../models/TeamcityDeveloper';

import { ITeamCityServer } from '../../Settings';
import { AutoMapper } from '../../util/AutoMapper';
import { Convert } from '../../util/Convert';

const timeBetweenFullSyncs = 60;
let request_args = {
    headers: {
        'Accept': 'application/json'
    }
};

export class DeveloperFetcher {
    private requestInProgress: boolean;

    constructor(private logger: ILogger, private developerCollection: IMongoCollection<TeamcityDeveloper>) {
        AutoMapper.createCustomMapping('restdeveloper', 'mongodeveloper', { createInDestination: true })
            .forMember('lastLogin', Convert.parseTeamcityDate);

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

    private saveUser(userDetails: TeamcityDeveloper, server: ITeamCityServer, existingUser: TeamcityDeveloper): Promise<TeamcityDeveloper> {
        if (_.isEqual(existingUser, userDetails)) {
            return;
        }
        var user = existingUser ? existingUser : new TeamcityDeveloper();
        this.logger.debug((existingUser ? 'Updating developer: ' : 'New developer found: ') + userDetails.username);
        AutoMapper.map('restdeveloper', 'mongodeveloper', userDetails, user);
        user.server = {
            name: server.name,
            url: server.url
        };
        return this.developerCollection.saveOrCreate(user);
    }

    private processUsers(userList, server: ITeamCityServer, forceRefresh) {
        var users = userList.user;
        return users.map(user => {
            return this.getExistingDeveloper(user.id)
                .then(existingUser => {
                    return server.get(server.url + user.href, request_args)
                        .then(user => this.saveUser(user, server, existingUser))
                        .catch(error => this.logger.errorException(`Could not get user for [${user.href}]`, error))
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

    private getAllUsers(server: ITeamCityServer): Promise<TeamcityDeveloper[]> {
        this.logger.debug('Checking for new TeamCity users');
        var doFullSync = this.timeSinceLastSync(server, 'developers') >= timeBetweenFullSyncs;
        return server.getUsers(request_args)
            .then(users => this.processUsers(users, server, doFullSync))
            .catch(error => {
                this.logger.errorException("Could not get users", error)
                throw error;
            });
    }

    refresh(server: ITeamCityServer): Promise<TeamcityDeveloper[]> {
        this.logger.debug('Refreshing TeamCity Developers');
        return this.getAllUsers(server);
    }
}