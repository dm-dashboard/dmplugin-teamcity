import { SyncManager } from './tasks/sync/SyncManager';
import { Injectable } from 'injection-js';
import { IPlugin, SocketManager, MongoConnection, WatchDog, Scheduler, ILogger, SettingsGetter, IWatchdogKicker } from 'dm-dashboard-core';

@Injectable()
export class TeamcityPlugin implements IPlugin {
    private syncManager: SyncManager;
    private logger: ILogger;

    name = 'dmplugin-teamcity';
    settings: SettingsGetter;
    defaultSettings = {
        servers: [
            {
                name: 'Default',
                url: 'http://123'
            }
        ]
    };

    constructor(
        private socketManager: SocketManager,
        private mongo: MongoConnection,
        private scheduler: Scheduler,
        private watchdog: WatchDog) {
    }

    init(logger: ILogger, settings: SettingsGetter, watchdogKicker: IWatchdogKicker) {
        this.logger = logger;
        this.settings = settings;
        this.logger.info('init');

        this.syncManager = new SyncManager(this.logger, watchdogKicker, this.mongo);

        this.scheduler.registerCallback(this.refreshBuild, this, 5000);
    }

    refreshBuild() {
        this.settings.get()
            .then(settings => {
                this.syncManager.refresh(settings);
            });
    }

    shutdown() {
        this.logger.info('shutdown');
    }
}


