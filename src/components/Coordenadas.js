import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEye, faRefresh, faSave, faGlobe, faThumbTack} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import MapaCoordenadas from './MapaCoordenadas';
import MapaAreasGuardadas from './MapaAreasGuardadas';
import '../css/Styles.css';

const Coordenadas = () => {
  const [coordenadas, setCoordenadas] = useState([]);
  const [area, setArea] = useState(null);
  const [selectedCoord, setSelectedCoord] = useState(null); 
  const [vistaActiva, setVistaActiva] = useState('coordenadas');
  const [mostrarMapaGuardado, setMostrarMapaGuardado] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [areasGuardadas, setAreasGuardadas] = useState([]);
  const [coordenadasAreaSeleccionada, setCoordenadasAreaSeleccionada] = useState([]);
  const apiUrl = 'https://0kk5e8xs2l.execute-api.us-east-1.amazonaws.com';

  useEffect(() => {
    const intervalId = setInterval(() => {
      obtenerCoordenadas();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const generarId = () => uuidv4();

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = String(hoy.getFullYear()).slice(-2);
    return `${dia}/${mes}/${año}`;
  };

  const obtenerCoordenadas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/coordenadas`, {
        headers: { 'Content-Type': 'application/json' },
      });
      setCoordenadas(response.data.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
    }
  };

  const obtenerAreasGuardadas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/areas`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const areas = response.data.sort((a, b) => a.id - b.id);
      setAreasGuardadas(areas);
      if (areas.length > 0) {
        const coordenadasFiltradas = areas[0].coordenadasArray.map(coord => ({
          lat: coord.lat,
          lon: coord.lon
        }));
        setCoordenadasAreaSeleccionada(coordenadasFiltradas);
      }
    } catch (error) {
      console.error('Error al obtener áreas guardadas:', error);
    }
  };

  const seleccionarAreaGuardada = (area) => {
    if (Array.isArray(area.coordenadasArray) && area.coordenadasArray.length > 0) {
      const coordenadasFiltradas = area.coordenadasArray.map(coord => ({
        lat: coord.lat,
        lon: coord.lon
      }));
      setCoordenadasAreaSeleccionada(coordenadasFiltradas);
      setArea(area.areaTotal);
    } else {
      setCoordenadasAreaSeleccionada([]);
      setArea(null);
    }
  };

  const eliminarCoordenada = async (id) => {
    try {
      await axios.delete(`${apiUrl}/coordenadas/${id}`);
      setCoordenadas((prev) => prev.filter(coord => coord.id !== id));
    } catch (error) {
      console.error('Error al eliminar coordenada:', error);
    }
  };

  const seleccionarCoordenada = (coord) => setSelectedCoord(coord.id);

  const borrarLista = () => {
    setCoordenadas([]);
    setArea("");
  };

  const calcularArea = () => {
    if (coordenadas.length >= 3) {
      const google = window.google;
      const path = coordenadas.map(coord => ({ lat: parseFloat(coord.lat), lng: parseFloat(coord.lon) }));
      const polygon = new google.maps.Polygon({ paths: path });
      setArea(google.maps.geometry.spherical.computeArea(polygon.getPath()).toFixed(2));
    } else {
      alert('Necesitas al menos 3 puntos para calcular el área');
    }
  };

  const guardarArea = async () => {
    try {
      const fecha = obtenerFechaActual();
      const id = generarId();
      if (coordenadas.length === 0) {
        alert("No hay coordenadas para enviar");
        return;
      }      
      const data = {
        id,
        titulo,
        descripcion,
        coordenadasArray: coordenadas,
        areaTotal: area + " m²",
        fechaHora: fecha,
      };
      await axios.put(`${apiUrl}/areas`, data, {
        headers: { "Access-Control-Allow-Origin": "*", 'Content-Type': 'application/json' },
      });
      alert('Área guardada exitosamente');
      setMostrarMapaGuardado(true);
    } catch (error) {
      console.error('Error al guardar el área:', error);
    }
  };

  return (
    <div className="contenedor-principal">
      <div className="contenedor-vistas">
        <div className="navegacion">
          <button onClick={() => { setVistaActiva('coordenadas'); setMostrarMapaGuardado(false); }} className={vistaActiva === 'coordenadas' ? 'activo' : ''}>
            <FontAwesomeIcon icon={faThumbTack} style={{ marginRight: '8px' }}/> Coordenadas
          </button>
          <button onClick={() => { 
            setVistaActiva('areasGuardadas'); 
            setMostrarMapaGuardado(true); 
            obtenerAreasGuardadas();
          }} className={vistaActiva === 'areasGuardadas' ? 'activo' : ''}>
            <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }}/> Áreas Guardadas
          </button>
          <button onClick={() => { setVistaActiva('guardarArea'); setMostrarMapaGuardado(false); }} className={vistaActiva === 'guardarArea' ? 'activo' : ''}>
            <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }}/> Guardar Área
          </button>
        </div>

        {vistaActiva === 'coordenadas' && (
          <div className="contenedor-comun lista-coordenadas">
            <h2>Coordenadas</h2>
            <ul>
              {coordenadas.map((coord) => (
                <li
                  key={coord.id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedCoord === coord.id ? '#ffe6e6' : '#f9f9f9',
                    textAlign: 'center'
                  }}
                  onClick={() => seleccionarCoordenada(coord)}
                >
                  {coord.lat}, {coord.lon}
                  <button className="boton-eliminar" onClick={() => eliminarCoordenada(coord.id)}>
                    <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px' }}/> Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {vistaActiva === 'guardarArea' && (
          <div className="contenedor-comun guardar-area">
            <h2>Guardar Área</h2>
            <input type="text" placeholder="Título del Área" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            <button onClick={guardarArea}><FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }}/> Guardar</button>
          </div>
        )}

        {vistaActiva === 'areasGuardadas' && (
          <div className="contenedor-comun lista-coordenadas">
            <h2>Áreas Guardadas</h2>
            <ul>
              {areasGuardadas.map((area) => (
                <li key={area.id} onClick={() => seleccionarAreaGuardada(area)}>
                  <strong>{area.titulo}</strong> - {area.descripcion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mapa">
        <h2 style={{ textAlign: 'center' }}>Mapa de {mostrarMapaGuardado ? 'Área Guardada' : 'Coordenadas'}</h2>
        
        {mostrarMapaGuardado ? (
          <MapaAreasGuardadas coordenadas={coordenadasAreaSeleccionada} />
        ) : (
          <MapaCoordenadas coordenadas={coordenadas} selectedCoord={selectedCoord} />
        )}
  
        <div className="botones">
          {!mostrarMapaGuardado ? (
            <>
              <button onClick={calcularArea}><FontAwesomeIcon icon={faEye} style={{ marginRight: '8px' }}/> Mostrar Área</button>
              <button onClick={borrarLista}><FontAwesomeIcon icon={faRefresh} style={{ marginRight: '8px' }}/> Recargar</button>
            </>
          ) : (
            <button onClick={obtenerAreasGuardadas}><FontAwesomeIcon icon={faRefresh} style={{ marginRight: '8px' }}/> Actualizar</button>
          )}
        </div>
  
        {area && <h3 style={{ textAlign: 'center' }}>Área total: {area}</h3>}
      </div>
    </div>
  );
};

export default Coordenadas;