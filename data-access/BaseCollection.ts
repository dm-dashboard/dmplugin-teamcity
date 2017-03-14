import { IMongoCollection } from './IMongoCollection';
import { Collection } from 'mongodb';

export class BaseCollection<T> implements IMongoCollection<T> {
    collection : Collection;
    constructor(collection : Collection) {
        this.collection = collection;
    }

    getById<T>(id: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.collection.findOne({id:id}, (err, result) => {
                if (err){
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    saveOrCreate<T>(document: T): Promise<T> {
        throw new Error('Method not implemented.');
    }

    deleteById(id: any): Promise<T> {
        throw new Error('Method not implemented.');
    }

    deleteDocument(document: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    
    find(query: {}): Promise<T[]> {
        throw new Error('Method not implemented.');
    }


}