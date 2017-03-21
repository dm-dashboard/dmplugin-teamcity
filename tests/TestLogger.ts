import { ILogger } from "dm-dashboard-core";

export class TestLogger implements ILogger {

    constructor(private logNonErrorsToConsole : boolean = false) {

    }

    fork(name: string): ILogger {
        return this;
    }
    info(message: any) {
        if (!this.logNonErrorsToConsole){
            return;
        }
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
        if (!this.logNonErrorsToConsole){
            return;
        }
        console.log(`debug - ${message}`);
    }
}