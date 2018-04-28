// this info is a static info as a result of this task it should come from our server.
import google from '../utils/googleGlobal';
const { maps } = google;

export default new maps.LatLngBounds(
    new maps.LatLng(34.818942,-92.1850488),
    new maps.LatLng(34.9287199, -92.074074)
);
