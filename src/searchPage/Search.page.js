import React, { Component } from 'react';
import Line from 'react-chartjs/lib/line';
import styled from 'styled-components';
import PlacesAutoComplete from '../components/PlacesAutoComplete';
import GoogleMap from '../components/GoogleMapWithMarker';
import google from '../utils/googleGlobal';
import {getIncidentsRadius} from "../utils/incidentsApi";
import normalizeByYears from "../utils/normalizeByYears";

const { maps } = google;
// init with jackvile map
const initialBounds = new maps.LatLngBounds(
    new maps.LatLng(34.818942,-92.1850488),
    new maps.LatLng(34.9287199, -92.074074)
);

const searchOptions = {
    bounds: initialBounds,
    strictBounds: true,
    types:['address'],
    componentRestrictions: {country: 'us'}
};

const PlotWrapper = styled.div`
  width: 300px;
  height: 300px;
  margin: 10px auto 0 auto;  
`;

const makeChartData = (incidentsByYears) => {
        const years = Object.keys(incidentsByYears).sort();
        return {
            labels: years,
            datasets: [
                {
                    label: 'Incidents by years',
                    data: years.map((k) => incidentsByYears[k].length),
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                }

            ]
    };
};

class SearchPage extends Component {
    state = {
        bounds: null,
        incidents: [],
        incidentsByYears: null
    };

    render(){
        const {bounds = null, incidents, chartData} = this.state;
        return (
            <div>
                <PlacesAutoComplete
                    searchOptions={searchOptions}
                    onSelectionChange={this._onSelectionChange} />
                <GoogleMap
                    initialBounds={initialBounds}
                    ref={(r) => this.map = r}
                    bounds={bounds}
                    incidents={incidents}
                    containerElement={<div style={{height: `400px`}}/>}
                    mapElement={<div style={{height: `100%`}}/>}
                />
                {chartData ? <PlotWrapper><Line data={chartData} /></PlotWrapper>: null }
            </div>
        );
    }

    _onSelectionChange = ({ geometry: { bounds } }) => {
        console.log(bounds.getCenter().lat(),bounds.getCenter().lng());
        this.map.fitBounds(bounds);
        getIncidentsRadius(bounds.getCenter(),500).then((incidents) => {
            const incidentsByYears = normalizeByYears(incidents);
            const chartData = makeChartData(incidentsByYears);
            this.setState({bounds, incidents, chartData});
        });

    }

}


export default SearchPage;
