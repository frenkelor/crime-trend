export default (incidents) => {
    return incidents.reduce((accumulator, incident) => {
        const incidentYear = new Date(incident.incident_datetime).getUTCFullYear();
        if(accumulator[incidentYear]){
            accumulator[incidentYear].push(incident);
        }else{
            accumulator[incidentYear] = [incident];
        }
        return accumulator;
    }, {});
}
