import * as moment from 'moment'

export class Convert {
    static parseTeamcityDate(src, dest, key) {
        dest[key] = moment(src[key], 'YYYYMMDDTHHmmssZZ');
    }

    static formatAsTeamcityDate(date) {
        return moment(date).format('YYYYMMDDTHHmmssZZ');
    };
}