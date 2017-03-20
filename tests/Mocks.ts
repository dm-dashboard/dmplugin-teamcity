import {TeamcityDeveloper} from '../models/TeamcityDeveloper';
import {ITeamCityServer} from '../Settings';
import {IMongoCollection, IMongoDocument} from '../data-access/IMongoCollection';
import * as TypeMoq from 'typemoq';

export function getMockCollection<T extends IMongoDocument>(data: T[], findQuery?: (T) => T[]) {
    let collection: TypeMoq.IMock<IMongoCollection<T>> = TypeMoq.Mock.ofType<IMongoCollection<T>>();
    collection.setup(c => c.getById(TypeMoq.It.isAnyNumber()))
        .returns(id => {
            return Promise.resolve(data.filter(item => item.id == id)[0])
        });

    collection.setup(c => c.deleteById(TypeMoq.It.isAnyNumber()))
        .returns(id => {
            data.splice(data.findIndex(item => item.id === id), 1);
            return Promise.resolve(true);
        });

    collection.setup(c => c.deleteDocument(TypeMoq.It.isAny()))
        .returns(doc => {
            data.splice(data.findIndex(item => item.id === doc.id), 1);
            return Promise.resolve(true)
        });

    collection.setup(c => c.find({}))
        .returns(doc => {
            if (findQuery) {
                return Promise.resolve(data.filter(findQuery));
            }
            return Promise.resolve([]);
        });

    collection.setup(c => c.saveOrCreate(TypeMoq.It.isAny()))
        .returns(doc => {
            let exists = data.findIndex(item => item.id === doc.id);
            if (exists >= 0) {
                data[exists] = doc;
            } else {
                data.push(doc);
            }
            return Promise.resolve(doc);
        });
    return collection;
}

export function getServer(): TypeMoq.IMock<ITeamCityServer> {
    let server: TypeMoq.IMock<ITeamCityServer> = TypeMoq.Mock.ofType<ITeamCityServer>();
    server.setup(s => s.name).returns(() => 'Test Server');
    server.setup(s => s.active).returns(() => true);
    server.setup(s => s.username).returns(() => '');
    server.setup(s => s.password).returns(() => '');
    server.setup(s => s.url).returns(() => '');
    return server;
}

export function getUser(id, username, email): TeamcityDeveloper {
    let dev = new TeamcityDeveloper();
    dev.id = id;
    dev.email = email;
    dev.username = username;
    dev.server = {
        name: 'Test Server',
        url: ''
    },
        dev.href = id;
    return dev;
}