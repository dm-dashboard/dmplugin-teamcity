export interface IMongoCollection<T> {
    getById<T>(id: any) : Promise<T>;
    saveOrCreate<T>(document : T) : Promise<T>;
    deleteById(id : any) : Promise<T>;
    deleteDocument(document : T) : Promise<T>;
    find(query : {}) : Promise<T[]>;
}