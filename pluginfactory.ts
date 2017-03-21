import { TeamcityPlugin } from './plugin';
import { FactoryProvider } from 'injection-js';
import { IPlugin, SocketManager, MongoConnection, WatchDog, Scheduler } from 'dm-dashboard-core';
require('reflect-metadata');

export default class TeamcityPluginFactory implements FactoryProvider {
    provide: any = TeamcityPlugin;
    deps = [SocketManager, MongoConnection, Scheduler, WatchDog];
    multi = false;
    useFactory(sm: SocketManager, mongo: MongoConnection, sch: Scheduler, wd: WatchDog): IPlugin {
        return new TeamcityPlugin(sm, mongo, sch, wd);
    };

}


