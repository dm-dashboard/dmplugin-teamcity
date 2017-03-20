import { TestLogger } from './TestLogger';
import { ITeamCityServer } from '../Settings';
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
import * as assert from 'assert';
import * as TypeMoq from 'typemoq';

import { TeamcityDeveloper } from '../models/TeamcityDeveloper';
import { DeveloperFetcher } from '../tasks/sync/DeveloperFetcher';
import { IMongoCollection, IMongoDocument } from '../data-access/IMongoCollection';
import { AppLogger, ILogger } from 'dmdashboard-core';

let logger: ILogger = new TestLogger();

function getMockCollection<T extends IMongoDocument>(data: T[], findQuery?: (T) => T[]) {
    let collection: TypeMoq.IMock<IMongoCollection<T>> = TypeMoq.Mock.ofType<IMongoCollection<T>>();

    collection.setup(c => c.getById(TypeMoq.It.isAnyNumber()))
        .returns(id => {
            console.log(`getById ${id}`)
            return Promise.resolve(data.filter(item => item.id == id)[0])
        });

    collection.setup(c => c.deleteById(TypeMoq.It.isAnyNumber()))
        .returns(id => {
            data.splice(data.findIndex(item => item.id === id), 1);
            return Promise.resolve(true);
        });

    collection.setup(c => c.deleteDocument(TypeMoq.It.isAny()))
        .returns(doc => {
            data.splice(data.findIndex(item => item.id === doc.id), 1);
            return Promise.resolve(true)
        });

    collection.setup(c => c.find({}))
        .returns(doc => {
            if (findQuery) {
                return Promise.resolve(data.filter(findQuery));
            }
            return Promise.resolve([]);
        });

    collection.setup(c => c.saveOrCreate(TypeMoq.It.isAny()))
        .returns(doc => {
            let exists = data.findIndex(item => item.id === doc);
            if (exists >= 0) {
                data[exists] = doc;
            } else {
                data.push(doc);
            }
            return Promise.resolve(doc);
        });
    return collection;
}

function getServer(): TypeMoq.IMock<ITeamCityServer> {
    let server: TypeMoq.IMock<ITeamCityServer> = TypeMoq.Mock.ofType<ITeamCityServer>();
    server.setup(s => s.name).returns(() => 'Test Server');
    server.setup(s => s.active).returns(() => true);
    server.setup(s => s.username).returns(() => '');
    server.setup(s => s.password).returns(() => '');
    server.setup(s => s.url).returns(() => '');
    return server;
}

function getUser(id, username, email, lastLogin) : TeamcityDeveloper {
    let dev = new TeamcityDeveloper();
    dev.id = id;
    dev.email = email;
    dev.username = username;
    dev.lastLogin = lastLogin;
    dev.server = {
        name : 'Test Server',
        url : ''
    },
    dev.href = id;
    return dev;
}

describe('SyncManager ->', () => {
    describe('DeveloperFetcher ->', () => {

        function getSUT(mongoCollection: IMongoCollection<TeamcityDeveloper>) {
            return new DeveloperFetcher(logger, mongoCollection);
        }

        describe('refresh', () => {
            it('should fetch a new user and save to mongo', () => {
                let collection = getMockCollection([]);
                let server = getServer();
                let allDevelopers: TeamcityDeveloper[] = [
                    getUser(1,'test1','test@test.com',new Date())
                ];
                server.setup(s => s.getUsers(TypeMoq.It.isAny())).returns(() => Promise.resolve({user : allDevelopers}));

                let sut = getSUT(collection.object);
                return sut.refresh(server.object);

            });
            it('should fetch an existing user and update in mongo when force refresh enabled', () => {
                assert.equal(1, 1);
            });
            it('should not fetch an existing user if force refresh is false', () => {
                assert.equal(1, 1);
            });
        });
    });

    describe('ProjectFetcher', () => {
        describe('refresh', () => {
            it('should fetch a new project and save to mongo', () => {
                assert.equal(1, 1);
            });
            it('should fetch an existing project and update in mongo', () => {
                assert.equal(1, 1);
            });
            it('should remove an existing project if no longer on server', () => {
                assert.equal(1, 1);
            });
        });
    });

    describe('BuildFetcher', () => {
        describe('refresh', () => {
            it('should only request builds since last refresh', () => {
                assert.equal(1, 1);
            });
            it('should save a new build', () => {
                assert.equal(1, 1);
            });
        });
    });
});