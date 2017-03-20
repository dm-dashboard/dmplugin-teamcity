//http://johnkalberer.com/2011/08/24/automapper-in-javascript/
import * as  _ from 'lodash';

const mappings = {};

export class AutoMapper {
    static map(sourceKey: string, destinationKey: string, sourceObject: {}, destinationObject: {}, oneTimeOptions?: {}) {
        var customMapping = mappings[sourceKey + destinationKey];
        oneTimeOptions = oneTimeOptions || {};
        var options = customMapping ? customMapping.options : {};
        options = _.extend(_.extend({}, options), oneTimeOptions);
        for (var key in sourceObject) {
            if (sourceObject.hasOwnProperty(key)) {
                var keyMappingFunction = null;
                if (customMapping && customMapping.hasOwnProperty(key)) {
                    keyMappingFunction = customMapping[key];
                }
                if (keyMappingFunction) {
                    keyMappingFunction(sourceObject, destinationObject, key);
                    continue;
                }

                if (options.createInDestination) {
                    destinationObject[key] = sourceObject[key];
                    continue;
                }
                if (destinationObject.hasOwnProperty(key)) {
                    destinationObject[key] = sourceObject[key];
                }
            }
        }
    }

    static mapToNew(sourceKey, destinationKey, sourceObject) {
        var newObject = {};
        this.map(sourceKey, destinationKey, sourceObject, newObject, { createInDestination: true });
        return newObject;
    };

    static createCustomMapping(sourceKey, destinationKey, options) {
        options = _.extend({}, options);
        var combinedKey = sourceKey + destinationKey;
        mappings[combinedKey] = {};
        mappings[combinedKey].options = options;
        var functions = {
            forMember: function (key, func) {
                mappings[combinedKey][key] = func;
                return functions;
            }
        };
        return functions;
    };
}