import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CrearReservacion from './components/CrearReservacion';
import ModificarReservacion from './components/ModificarReservacion';
import Canchas from './components/Canchas';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div>
        <header className="fixed-header">
          <h1>Reservas de cancha de Paddle</h1>
        </header>
        <div className="content">
          <Routes>
            <Route path="/" element={<Canchas />} />
            <Route path="/reservaciones/crear/:canchaId" element={<CrearReservacion />} />
            <Route path="/reservaciones/modificar/:reservaId" element={<ModificarReservacion />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
