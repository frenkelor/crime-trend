import React, { Component } from 'react';
import normalizeByYears from "../utils/normalizeByYears";
import Line from 'react-chartjs/lib/line';
import styled from 'styled-components';
import { Range, createSliderWithTooltip } from 'rc-slider';
import GoogleMap from '../components/GoogleMapWithMarker';
import {getIncidentsRadius} from "../utils/incidentsApi";
import initialBounds from '../utils/cityBounds';
import {searchStateFromQueryString} from '../utils/searchStateFromQueryString';
import google from '../utils/googleGlobal';

import 'rc-slider/assets/index.css';

const currentYear = new Date().getUTCFullYear();

const Max = currentYear;
const Min = currentYear - 10;

const RangeWithTooltip = createSliderWithTooltip(Range);

const getPlotYears = (min = Min, max = Max) => {
    const yearsArray = [];
    for (let i = min; i <= max ; i+=1){
        yearsArray.push(i);
    }
    return yearsArray;
};

const insertMissingYears = (incidentsByYears, plotYears = getPlotYears()) => {
    plotYears.forEach((year) => {
        if(!incidentsByYears[`${year}`]){
            incidentsByYears[`${year}`] = [];
        }
    });
    return incidentsByYears;
};

const filterByQuery = (min, max, incidentsByYears) => {
    const filteredData = {};
    for(let i = min; i < max; i+=1){
        const key = `${i}`;
        filteredData[key] =  [
            ...incidentsByYears[key]
        ];
    }
    return filteredData;
};

const makeChartData = (incidentsByYears) => {
    incidentsByYears = insertMissingYears(incidentsByYears);
    const years = Object.keys(incidentsByYears).sort();
    return {
        labels: years,
        datasets: [
            {
                label: 'Incidents by years',
                data: years.map((k) => {
                    return incidentsByYears[`${k}`].length
                }),
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
            }

        ]
    };
};

const StatsPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 16px;
`;

const PlotWrapper = styled.div`  
  margin: 10px auto 16px auto;  
`;

const MapPageLayout = styled.div`
  display: flex;
`;

const Title = styled.div`
  width: 100%;  
`;

const Page = styled.div`
  margin: 50px;
`;

export default class CrimeTrend extends Component{
    constructor(props){
        super(props);
        const searchState = searchStateFromQueryString(props.location.search);
        const {ne_lat, ne_lng, sw_lat, sw_lng} = searchState;
        const southWest = new google.maps.LatLng(Number(sw_lat), Number(sw_lng));
        const northEast = new google.maps.LatLng(Number(ne_lat), Number(ne_lng));
        const bounds = new google.maps.LatLngBounds(southWest,northEast);
        this.state = {
            searchState,
            bounds,
            incidents: []
        };

    }

    componentDidMount(){
        const {bounds} = this.state;
        this.fetchCrime(bounds)
    }

    fetchCrime(bounds){
        getIncidentsRadius(bounds.getCenter(),500).then((incidents) => {
            this.map.fitBounds(bounds);
            const incidentsByYears = normalizeByYears(incidents);
            const chartData = makeChartData(incidentsByYears);
            this.setState({bounds, incidents, chartData, incidentsByYears});
        });
    }

    _onYearsFilterChange = ([min, max]) => {
        this.setState(({incidentsByYears, chartData}) => {
            Object.keys(incidentsByYears).forEach(() => this.chart.removeData());
            const newChartData = makeChartData(filterByQuery(min, max, incidentsByYears));
            this.chart.addData(newChartData.datasets, newChartData.label);
            return {min, max, chartData: newChartData};
        }, () => {
            this.chart.update();
        });
    };

    render(){
        const { incidents, chartData, bounds, searchState} = this.state;
        return (
            <Page>
                <Title>{`Results for: "${searchState.q || ''}"`}</Title>
                <MapPageLayout>
                    <StatsPanel>
                        <PlotWrapper> { chartData ? <Line ref={(l) => this.chart = l } width={500} options={{
                            maintainAspectRatio: true
                        }} data={chartData} />: null }
                        </PlotWrapper>
                        <RangeWithTooltip dots onChange={this._onYearsFilterChange} allowCross={false} max={Max} min={Min} defaultValue={[Min,Max]}/>
                    </StatsPanel>
                    <GoogleMap
                        initialBounds={initialBounds}
                        ref={(r) => this.map = r}
                        bounds={bounds}
                        incidents={incidents}
                        containerElement={<div style={{height: `400px`, flex: 1}}/>}
                        mapElement={<div style={{height: `100%`}}/>}
                    />
                </MapPageLayout>
            </Page>
        );
    }
}
