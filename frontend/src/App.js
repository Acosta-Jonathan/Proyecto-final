import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Canchas from './components/Canchas';
import Reservaciones from './components/Reservaciones';

function App() {

  return (
    <Router>
      <div>
        <Routes>
          {/* Ruta principal que muestra todas las canchas */}
          <Route path="/" element={<Canchas />} />
          
          {/* Ruta para manejar las reservaciones de una cancha específica */}
          <Route path="/reservaciones/:cancha_id" element={<Reservaciones />} />
        </Routes>
      </div>
    </Router>
  );
  // return (
  //   <div className="App">
  //     <header className="bg-primary text-white text-center py-5 animate__animated animate__fadeIn">
  //       <h1>Reservas de cancha de Paddle</h1>
  //       <p>Gestiona tus reservaciones</p>
  //     </header>
  //     <main>
  //       <Reservaciones />
  //     </main>
  //   </div>
  // );
}

export default App;
