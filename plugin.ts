import { Injectable } from 'injection-js';
import { IPlugin, SocketManager, MongoConnection, WatchDog, Scheduler, ILogger, SettingsGetter } from 'dmdashboard-core';

@Injectable()
export class TeamcityPlugin implements IPlugin {
    private logger: ILogger;

    name = 'teamcity';
    settings: SettingsGetter;
    defaultSettings = {
        servers: [
            {
                name: 'Default',
                path: 'http://123'
            }
        ]
    };

    constructor(
        private socketManager: SocketManager,
        private mongo: MongoConnection,
        private scheduler: Scheduler,
        private watchdog: WatchDog) {
    }

    init(logger: ILogger, settings: SettingsGetter) {
        this.logger = logger;
        this.settings = settings;
        this.logger.info('init');
        this.scheduler.registerCallback(this.refresh, this, 5000);
    }

    refresh() {
        this.settings.get()
            .then(dbSettings => {
                this.logger.debug('Tick');
            });
    }

    shutdown() {
        this.logger.info('shutdown'); 
    }
}


