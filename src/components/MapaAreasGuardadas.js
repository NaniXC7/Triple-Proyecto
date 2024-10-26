// MapaAreasGuardadas.js
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Polygon, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '65vw',
  height: '60vh',
};

const MapaAreasGuardadas = ({ coordenadas }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCECcU3Gltx0k5qLECew1paVTwi-MretBc',
    libraries: ['geometry'],
  });

  const [map, setMap] = useState(null);

  useEffect(() => {
    console.log("Coordenadas para área guardada recibidas:", coordenadas);
    if (coordenadas.length > 0 && map) {
      map.panTo({
        lat: parseFloat(coordenadas[0].lat),
        lng: parseFloat(coordenadas[0].lon),
      });
    }
  }, [coordenadas, map]);

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const polygonOptions = {
    fillColor: 'lightblue',
    fillOpacity: 0.4,
    strokeColor: 'blue',
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1,
  };

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={coordenadas.length > 0 ? { lat: parseFloat(coordenadas[0].lat), lng: parseFloat(coordenadas[0].lon) } : { lat: 0, lng: 0 }}
        zoom={coordenadas.length > 0 ? 15 : 2}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {coordenadas.map((coord, index) => (
          <Marker
            key={index}
            position={{ lat: parseFloat(coord.lat), lng: parseFloat(coord.lon) }}
          />
        ))}

        {coordenadas.length >= 3 && (
          <Polygon
            paths={coordenadas.map(({ lat, lon }) => ({
              lat: parseFloat(lat),
              lng: parseFloat(lon),
            }))}
            options={polygonOptions}
          />
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Cargando mapa...</div>
  );
};

export default MapaAreasGuardadas;
