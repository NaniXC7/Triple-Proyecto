import React from 'react';
import Coordenadas from './components/Coordenadas';
import './css/Styles.css';

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center' }}>GeoSync App</h1>
      <Coordenadas />
    </div>
  );
}

export default App;
