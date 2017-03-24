import { ObjectID} from 'mongodb';

export interface IMongoDocument {
    id : any;
    _id : ObjectID;
}

export interface IMongoCollection<T extends IMongoDocument> {
    getById<T>(id: any) : Promise<T>;
    saveOrCreate<T>(document : T) : Promise<T>;
    deleteById(id : any) : Promise<boolean>;
    deleteDocument(document : T) : Promise<boolean>;
    find(query : {}) : Promise<T[]>;
}