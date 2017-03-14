import { TeamcityDeveloper } from '../models/TeamcityDeveloper';
import { BaseCollection } from './BaseCollection';
import { Collection } from 'mongodb';


export class TeamcityDeveloperCollection extends BaseCollection<TeamcityDeveloper> {
    constructor(collection : Collection) {
        super(collection);
    }
}