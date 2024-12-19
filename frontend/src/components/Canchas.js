import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { canchasService } from '../services/canchasService';
import { reservacionesService } from '../services/reservacionesService';

function Canchas() {
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [canchaVisualizada, setCanchaVisualizada] = useState(null);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [error, setError] = useState("");
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [mostrarResultadosBusqueda, setMostrarResultadosBusqueda] = useState(false);

  useEffect(() => {
    cargarCanchas();
  }, []);

  const cargarCanchas = async () => {
    try {
      const data = await canchasService.obtenerCanchas();
      setCanchas(data);
    } catch (error) {
      console.error("Error al cargar canchas:", error);
    }
  };

  const handleVerReservas = async (cancha) => {
    try {
      if (canchaVisualizada === cancha.id) {
        setCanchaVisualizada(null);
        setReservas([]);
        return;
      }
      const reservasData = await reservacionesService.obtenerReservasPorCancha(cancha.id);
      setReservas(reservasData);
      setCanchaVisualizada(cancha.id);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }
  };

  const handleCanchaChange = (e) => {
    setCanchaSeleccionada(e.target.value);
  };

  const handleFechaChange = (e) => {
    setFechaSeleccionada(e.target.value);
  };

  const handleBuscarReservas = async () => {
    if (canchaSeleccionada && fechaSeleccionada) {
      try {
        const reservas = await reservacionesService.obtenerReservasPorCanchaYFecha(
          canchaSeleccionada,
          fechaSeleccionada
        );
        setReservasFiltradas(reservas);
        setMostrarResultadosBusqueda(true);
      } catch (error) {
        console.error("Error al buscar reservas:", error);
      }
    }
  };

  // Crear nueva reserva
  const handleCreateReserva = (canchaId) => {
    window.location.href = `/reservaciones/crear/${canchaId}`;
  };

  const handleModificarReserva = (id) => {
    window.location.href = `/reservaciones/modificar/${id}`;
  };

  const handleEliminarReserva = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta reserva?')) {
      try {
        await reservacionesService.eliminarReservacion(id);
        // Actualizar la lista de reservas
        if (canchaVisualizada) {
          const reservasActualizadas = await reservacionesService.obtenerReservasPorCancha(canchaVisualizada);
          setReservas(reservasActualizadas);
        }
      } catch (error) {
        console.error("Error al eliminar reserva:", error);
      }
    }
  };

  return (
    
    <div className="container-fluid mt-4">
      <div className="blurred-container">
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
                  {cancha.nombre}{" "}
                  {cancha.techada ? "(Techada)" : "(No Techada)"}
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
        {error && (
          <h4 className="text-Black mt-3">
            <strong>{error}</strong>
          </h4>
        )}
      </Form>

      {/* Nueva sección para mostrar resultados de búsqueda */}
      {mostrarResultadosBusqueda && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Resultados de búsqueda</h5>
            <small>
              Cancha: {canchas.find(c => c.id === parseInt(canchaSeleccionada))?.nombre} - 
              Fecha: {fechaSeleccionada}
            </small>
          </Card.Header>
          <Card.Body>
            {reservasFiltradas.length > 0 ? (
              <ListGroup>
                {reservasFiltradas.map((reserva) => (
                  <ListGroup.Item
                    key={reserva.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>Hora Inicio:</strong> {reserva.hora_inicio} <br />
                      <strong>Duración:</strong> {reserva.duracion} minutos <br />
                      <strong>Contacto:</strong> {reserva.nombre_contacto} <br />
                      <strong>Teléfono:</strong> {reserva.telefono_area}-{reserva.telefono_numero} <br />
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
            ) : (
              <Alert variant="info">
                No hay reservas para la fecha y cancha seleccionadas
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Row>
        {canchas.map((cancha) => (
          <Col key={cancha.id} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title>{cancha.nombre}</Card.Title>
                  <div>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleVerReservas(cancha)}
                    >
                      {canchaVisualizada === cancha.id ? 'Ocultar Reservas' : 'Ver Reservas'}
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
                </div>
                <Card.Text>
                  Estado: {cancha.techada ? 'Techada' : 'No techada'}
                </Card.Text>
                {canchaVisualizada === cancha.id && (
                  <div className="mt-3">
                    {reservas.length > 0 ? (
                      <ListGroup>
                        {reservas.map((reserva) => (
                          <ListGroup.Item
                            key={reserva.id}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <strong>Fecha:</strong> {reserva.fecha} <br />
                              <strong>Hora Inicio:</strong> {reserva.hora_inicio} <br />
                              <strong>Duración:</strong> {reserva.duracion} minutos <br />
                              <strong>Contacto:</strong> {reserva.nombre_contacto} <br />
                              <strong>Teléfono:</strong> {reserva.telefono_area}-{reserva.telefono_numero} <br />
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
                    ) : (
                      <Alert variant="info">
                        No hay reservas para esta cancha
                      </Alert>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      </div>
    </div>
  );
}

export default Canchas;