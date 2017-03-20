export interface IMongoDocument {
    id : number;
}

export interface IMongoCollection<T extends IMongoDocument> {
    getById<T>(id: any) : Promise<T>;
    saveOrCreate<T>(document : T) : Promise<T>;
    deleteById(id : any) : Promise<boolean>;
    deleteDocument(document : T) : Promise<boolean>;
    find(query : {}) : Promise<T[]>;
}