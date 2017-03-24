import { IMongoCollection, IMongoDocument } from './IMongoCollection';
import { Collection, MongoCallback } from 'mongodb';
import { wrap } from '../util/Promisify';

export class BaseCollection<T extends IMongoDocument> implements IMongoCollection<T> {
    collection: Collection;

    private wrapped_save : (...args: any[]) => Promise<T>;
    private wrapped_insert : (...args: any[]) => Promise<T>;
    private wrapped_find : (...args: any[]) => Promise<T>;
    private wrapped_remove : (...args: any[]) => Promise<T>;
    
    constructor(collection: Collection) {
        this.collection = collection;
        this.wrapped_save = wrap<T>(this.collection, this.collection.save);
        this.wrapped_insert = wrap<T>(this.collection, this.collection.insert);
        this.wrapped_find = wrap<T>(this.collection, this.collection.find);
        this.wrapped_remove = wrap<T>(this.collection, this.collection.remove);
    }

    getById<T extends IMongoDocument>(id: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.collection.findOne({ id: id }, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    async saveOrCreate<T extends IMongoDocument>(document: T) {
        if (document._id) {
            return await this.wrapped_save(document, {});            
        } 
        return await this.wrapped_insert(document, {});        
    }

    deleteById(id: any): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    deleteDocument<T extends IMongoDocument>(document: T): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    find<T extends IMongoDocument>(query: {}): Promise<T[]> {
        throw new Error('Method not implemented.');
    }


}