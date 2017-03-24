import { IMongoDocument } from '../data-access/IMongoCollection';

export function wrap<S>(context, f): () => Promise<S> {
    return function (...args: any[]) {
        //var args = Array.prototype.slice.call(arguments);
        return new Promise<S>((resolve, reject) => {
            args.push((err, response) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            });
            f.apply(context, args);
        });
    }
}