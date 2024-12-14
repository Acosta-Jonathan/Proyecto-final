import React from 'react';
import Canchas from './components/Canchas';
import Reservaciones from './components/Reservaciones';

function App() {
  return (
    <div className="App">
      <header className="bg-primary text-white text-center py-5 animate__animated animate__fadeIn">
        <h1>Reservas de cancha de Paddle</h1>
        <p>Gestiona tus reservaciones</p>
      </header>
      <main>
        <Reservaciones />
      </main>
    </div>
  );
}

export default App;
