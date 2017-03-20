import { TestLogger } from './TestLogger';
import { ITeamCityServer } from '../Settings';
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
//import * as assert from 'assert';
import * as chai from 'chai';
import * as TypeMoq from 'typemoq';

import { TeamcityDeveloper } from '../models/TeamcityDeveloper';
import { DeveloperFetcher } from '../tasks/sync/DeveloperFetcher';
import { IMongoCollection, IMongoDocument } from '../data-access/IMongoCollection';
import { AppLogger, ILogger } from 'dmdashboard-core';
import * as Mocks from './Mocks';

let logger: ILogger = new TestLogger();
let assert = chai.assert;
let expect = chai.expect;
chai.should();

console.log(new Date());
describe('SyncManager ->', () => {
    describe('DeveloperFetcher ->', () => {

        function getSUT(mongoCollection: IMongoCollection<TeamcityDeveloper>) {
            return new DeveloperFetcher(logger, mongoCollection);
        }

        function assertUser(actualUser: TeamcityDeveloper, expectedUser: TeamcityDeveloper) {
            expect(actualUser.email).to.equal(expectedUser.email);
            expect(actualUser.href).to.equal(expectedUser.href);
            expect(actualUser.id).to.equal(expectedUser.id);
            expect(actualUser.server.name).to.equal(expectedUser.server.name);
            expect(actualUser.username).to.equal(expectedUser.username);
        }

        describe('refresh', () => {
            it('should fetch a new user and save to mongo', () => {
                let savedDevelopers = [];
                let collection = Mocks.getMockCollection(savedDevelopers);
                let server = Mocks.getServer();
                let allDevelopers: TeamcityDeveloper[] = [
                    Mocks.getUser(1, 'test1', 'test@test.com', new Date())
                ];
                server.setup(s => s.getUsers(TypeMoq.It.isAny()))
                    .returns(() => Promise.resolve({ user: allDevelopers }))
                    .verifiable(TypeMoq.Times.exactly(1));
                server.setup(s => s.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()))
                    .returns((url, options) => Promise.resolve(allDevelopers[0]))
                    .verifiable(TypeMoq.Times.exactly(2));;

                let sut = getSUT(collection.object);
                return sut.refresh(server.object)
                    .then(() => {
                        collection.verifyAll();
                        expect(savedDevelopers).to.have.lengthOf(1);
                        let savedDeveloper = savedDevelopers[0];
                        assertUser(savedDeveloper, allDevelopers[0]);
                    });
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