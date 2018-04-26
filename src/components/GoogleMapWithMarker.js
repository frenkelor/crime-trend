import React, {Component, PureComponent} from "react";
import { GoogleMap, withGoogleMap, Rectangle, Marker, Circle } from "react-google-maps"
import google from "../utils/googleGlobal";
import { getAllIncidents } from '../utils/incidentsApi';

const WORLD_DIM = { height: 256, width: 256 };
const ZOOM_MAX = 21;

function getBoundsZoomLevel(bounds, map) {
    if(!bounds || !map){
        return 10;
    }
    const el = map.getDiv();
    const mapDim = { width: el.offsetWidth, height: el.offsetHeight };

    function latRad(lat) {
        const sin = Math.sin(lat * Math.PI / 180);
        const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    const lngDiff = ne.lng() - sw.lng();
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);
    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

class GoogleMapEl extends PureComponent{
    _map = null;
    render(){
        const {innerRef, bounds, initialBounds, markers, incidents} = this.props;
        return (<GoogleMap
                defaultMapTypeId={'hybrid'}
                ref={(r) => {this._map = r; innerRef(r)}}
                defaultZoom={getBoundsZoomLevel(bounds, this._map)}
                defaultCenter={initialBounds.getCenter()}
            >
                {initialBounds ? <Rectangle bounds={initialBounds} /> : null }
                {bounds ? <Circle center={bounds.getCenter()}
                                  radius={500} /> : null }
                {bounds || initialBounds ? <Marker icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: 'rgba(111,120,142,.19)',
                    fillOpacity: 0.8,
                    strokeColor: 'gold',
                    strokeWeight: 2,
                    scale: 10
                }} position={(bounds || initialBounds).getCenter()} /> : null }
                {incidents ? incidents.map((m, i) => <Marker key={`i_${i}`} position={new google.maps.LatLng(Number(m.latitude),Number(m.longitude))} />) : null }
                {!incidents && markers ? markers.map((m, i) => <Marker key={`i_${i}`} position={new google.maps.LatLng(Number(m.latitude),Number(m.longitude))} />) : null }

            </GoogleMap>
        );
    }
}

const WithGoogleMap = withGoogleMap(GoogleMapEl);

class GoogleMapWithMarker extends Component {

    _map = null;

    componentDidMount(){
        getAllIncidents().then((m) => {
            this.setState({ markers: m });
        });
    }

    fitBounds(bounds){
        this._map && this._map.fitBounds(bounds);
    }

    render(){

        return (
            <WithGoogleMap
                {...this.props}
                markers={(this.state || {}).markers}
                innerRef={(r) => this._map = r}
            />
        );
    }
}


export default GoogleMapWithMarker;
