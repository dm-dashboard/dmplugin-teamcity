/// <reference path="../node_modules/@types/mocha/index.d.ts" />
import * as assert from 'assert';

import { DeveloperFetcher } from '../tasks/sync/DeveloperFetcher';

describe('syncManager', () => {
    describe('DeveloperFetcher', () => {
        describe('refresh', () => {
            it('should fetch a new user and save to mongo', () => {
                assert.equal(1, 1);
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