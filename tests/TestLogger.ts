import { ILogger } from "dmdashboard-core";

export class TestLogger implements ILogger {
    fork(name: string): ILogger {
        return this;
    }
    info(message: any) {
        if (typeof (message) === 'object') {
            console.dir(message);
        } else {
            console.log(`info - ${message}`);
        }
    }
    error(message: any) {
        console.error(`error - ${message}`);
    }
    errorException(message: any, error: Error) {
        console.error(`error - ${message}`);
        console.error(error);
    }
    debug(message: any) {
        console.log(`debug - ${message}`);
    }
}