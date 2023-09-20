export default function decodePolyline(polyline) {
    const coords = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
  
    while (index < polyline.length) {
      let shift = 0;
      let result = 0;
  
      while (true) {
        const byte = polyline.charCodeAt(index) - 63;
        index += 1;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (!(byte >= 0x20)) {
          break;
        }
      }
  
      lat += result & 1 ? ~(result >> 1) : result >> 1;
      shift = 0;
      result = 0;
  
      while (true) {
        const byte = polyline.charCodeAt(index) - 63;
        index += 1;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (!(byte >= 0x20)) {
          break;
        }
      }
  
      lng += result & 1 ? ~(result >> 1) : result >> 1;
      coords.push({ latitude: lat / 100000.0, longitude: lng / 100000.0});
    }
  
    return coords;
}

