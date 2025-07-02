import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function LocationPicker({ value, onChange }) {
  const defaultPosition = [-1.286389, 36.817223];
  const position = value?.length === 2 ? [value[1], value[0]] : defaultPosition;

  function LocationMarker() {
    useMapEvents({
      click(e) {
        onChange([e.latlng.lng, e.latlng.lat]);
      },
    });
    return value ? <Marker position={position} icon={markerIcon} /> : null;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: 250, width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

export default LocationPicker; 