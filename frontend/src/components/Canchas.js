import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { canchasService } from '../services/canchasService';
import { reservacionesService } from '../services/reservacionesService';
import 'bootstrap/dist/css/bootstrap.min.css';

function Canchas() {
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [canchaVisualizada, setCanchaVisualizada] = useState(null); // Estado para "Ver Reservas"
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(''); // Estado para el formulario de búsqueda
  const [fechaSeleccionada, setFechaSeleccionada] = useState(''); // Para la búsqueda por fecha
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar canchas al inicio
  useEffect(() => {
    async function cargarCanchas() {
      const data = await canchasService.obtenerCanchas();
      setCanchas(data);
    }
    cargarCanchas();
  }, []);

  // Manejar cambios en el select de cancha
  const handleCanchaChange = (e) => {
    setCanchaSeleccionada(e.target.value);
  };

  // Manejar cambios en el campo de fecha
  const handleFechaChange = (e) => {
    setFechaSeleccionada(e.target.value);
  };

  // Manejar búsqueda de reservas
  const handleBuscarReservas = async () => {
    if (!canchaSeleccionada || !fechaSeleccionada) {
      setError('Debe seleccionar una cancha y una fecha.');
      return;
    }
    try {
      setError('');
      const reservas = await reservacionesService.obtenerReservasPorCanchaYFecha(
        canchaSeleccionada,
        fechaSeleccionada
      );
      setReservasFiltradas(reservas);
    } catch (error) {
      setError('No se encontraron reservas para los criterios seleccionados.');
    }
  };

  // Cargar reservas de una cancha visualizada
  const cargarReservas = async (canchaId) => {
    try {
      const data = await reservacionesService.obtenerReservasPorCancha(canchaId);
      setReservas(data);
      const cancha = canchas.find((c) => c.id === parseInt(canchaId));
      setCanchaVisualizada(cancha); // Actualizar la cancha visualizada
    } catch (error) {
      console.error('Error al cargar reservas', error);
    }
  };

  // Crear nueva reserva
  const handleCreateReserva = (canchaId) => {
    navigate(`/reservaciones/crear/${canchaId}`);
  };

  // Modificar reserva
  const handleModificarReserva = (reservaId) => {
    navigate(`/reservaciones/modificar/${reservaId}`);
  };

  // Eliminar reserva
  const handleEliminarReserva = async (reservaId) => {
    try {
      await reservacionesService.eliminarReservacion(reservaId);
      if (canchaVisualizada) {
        cargarReservas(canchaVisualizada.id); // Recargar reservas
      }
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h4>Consultar Reservas</h4>
      {/* Bloque de búsqueda por fecha y cancha */}
      <Form className="mb-4">
        <div className="d-flex gap-3">
          <Form.Group>
            <Form.Label>Seleccionar Cancha</Form.Label>
            <Form.Select
              value={canchaSeleccionada}
              onChange={handleCanchaChange}
            >
              <option value="">-- Seleccione una cancha --</option>
              {canchas.map((cancha) => (
                <option key={cancha.id} value={cancha.id}>
                  {cancha.nombre} {cancha.techada ? '(Techada)' : '(No Techada)'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
  
          <Form.Group>
            <Form.Label>Seleccionar Fecha</Form.Label>
            <Form.Control
              type="date"
              value={fechaSeleccionada}
              onChange={handleFechaChange}
            />
          </Form.Group>
  
          <div className="d-flex align-items-end">
            <Button variant="primary" onClick={handleBuscarReservas}>
              Buscar Reservas
            </Button>
          </div>
        </div>
        {error && <h4 className="text-Black mt-3"><strong>{error}</strong></h4>}
      </Form>
  
      {/* Mostrar reservas filtradas inmediatamente debajo del formulario */}
      {reservasFiltradas.length > 0 && (
        <div className="mt-4">
          <h5>Reservas Filtradas</h5>
          <ListGroup>
            {reservasFiltradas.map((reserva) => (
              <ListGroup.Item key={reserva.id} className="list-item-hover">
                <strong>Fecha:</strong> {reserva.fecha} <br />
                <strong>Hora Inicio:</strong> {reserva.hora_inicio} <br />
                <strong>Duración:</strong> {reserva.duracion} minutos <br />
                <strong>Contacto:</strong> {reserva.nombre_contacto}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
  
      {/* Lista de canchas */}
      <h4 className="mt-4">Lista de Canchas</h4>
      <ListGroup>
        {canchas.map((cancha) => (
          <ListGroup.Item key={cancha.id} className="list-item-hover">
            <div>
              <span>
                {cancha.nombre} {cancha.techada ? '(Techada)' : '(No Techada)'}
              </span>
              <Button
                variant="info"
                size="sm"
                onClick={() => cargarReservas(cancha.id)}
                className="ms-2"
              >
                Ver Reservas
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleCreateReserva(cancha.id)}
                className="ms-2"
              >
                Crear Reserva
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
  
      {/* Mostrar reservas de una cancha visualizada */}
      {canchaVisualizada && reservas.length > 0 && (
        <div className="mt-4">
          <h5>Reservas para: {canchaVisualizada.nombre}</h5>
          <ListGroup>
            {reservas.map((reserva) => (
              <ListGroup.Item
                key={reserva.id}
                className="d-flex justify-content-between align-items-center list-item-hover"
              >
                <div>
                  <strong>Fecha:</strong> {reserva.fecha} <br />
                  <strong>Hora Inicio:</strong> {reserva.hora_inicio} <br />
                  <strong>Duración:</strong> {reserva.duracion} minutos <br />
                  <strong>Contacto:</strong> {reserva.nombre_contacto} <br />
                  <strong>Teléfono:</strong> {reserva.telefono_contacto}
                </div>
                <div>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleModificarReserva(reserva.id)}
                    className="me-2"
                  >
                    Modificar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminarReserva(reserva.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );  
}

export default Canchas;
