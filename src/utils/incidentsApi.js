import soda from 'soda-js';

const consumer = new soda.Consumer('moto.data.socrata.com');

function baseQuery(){
   return consumer.query()
       .withDataset('7pap-2yk6');
}

export const getIncidentsRadius = (center, mitters) => {
    return new Promise((resolve, reject) => {
            baseQuery()
            .where(`within_circle(location, ${center.lat()}, ${center.lng()}, ${mitters})`)
            .getRows()
            .on('success', function(rows) { resolve(rows); })
            .on('error', function(error) { reject(error); });
    })
};

export const getAllIncidents = () => {
    return new Promise((resolve, reject) => {
        baseQuery()
            .getRows()
            .on('success', function(rows) { resolve(rows); })
            .on('error', function(error) { reject(error); });
    });
};
