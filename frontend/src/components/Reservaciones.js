import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Card } from 'react-bootstrap';
import { reservacionesService } from '../services/reservacionesService';
import { canchasService } from '../services/canchasService';

function Reservaciones() {
  const [reservaciones, setReservaciones] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [nuevaReservacion, setNuevaReservacion] = useState({
    cancha_id: '',
    fecha: '',
    hora_inicio: '',
    duracion: 0,
    nombre_contacto: '',
    telefono_contacto: ''
  });
  const [editandoReservacion, setEditandoReservacion] = useState(null);

  useEffect(() => {
    cargarReservaciones();
    cargarCanchas();
  }, []);

  const cargarReservaciones = async () => {
    try {
      const data = await reservacionesService.obtenerReservaciones();
      setReservaciones(data);
    } catch (error) {
      alert('Error al cargar reservaciones');
    }
  };

  const cargarCanchas = async () => {
    try {
      const data = await canchasService.obtenerCanchas();
      setCanchas(data);
    } catch (error) {
      console.error('Error al cargar las canchas:', error);
    }
  };

  const handleCrearReservacion = async (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!nuevaReservacion.cancha_id || !nuevaReservacion.fecha || !nuevaReservacion.hora_inicio) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    try {
      await reservacionesService.crearReservacion(nuevaReservacion);
      cargarReservaciones();
      setNuevaReservacion({
        cancha_id: '',
        fecha: '',
        hora_inicio: '',
        duracion: 0,
        nombre_contacto: '',
        telefono_contacto: ''
      });
    } catch (error) {
      alert(`Error: ${error.response.data.detail}`);
    }
  };

  const handleModificarReservacion = async (e) => {
    e.preventDefault();

    try {
      await reservacionesService.modificarReservacion(editandoReservacion.id, nuevaReservacion);
      cargarReservaciones();
      setEditandoReservacion(null); // Termina la edición
      setNuevaReservacion({
        cancha_id: '',
        fecha: '',
        hora_inicio: '',
        duracion: 0,
        nombre_contacto: '',
        telefono_contacto: ''
      });
    } catch (error) {
      alert('Error al modificar reservación');
    }
  };

  const handleEliminarReservacion = async (id) => {
    try {
      await reservacionesService.eliminarReservacion(id);
      cargarReservaciones(); // Actualiza la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar reservación:', error);
    }
  };

  const handleEditar = (reservacion) => {
    setEditandoReservacion(reservacion);
    setNuevaReservacion({
      cancha_id: reservacion.cancha_id,
      fecha: reservacion.fecha,
      hora_inicio: reservacion.hora_inicio,
      duracion: reservacion.duracion,
      nombre_contacto: reservacion.nombre_contacto,
      telefono_contacto: reservacion.telefono_contacto
    });
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h2 className="text-center">Gestión de Reservaciones</h2>
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => setEditandoReservacion(null)} // Para crear una nueva reserva
          >
            Crear Nueva Reservación
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4>Listado de Reservaciones</h4>
              <ListGroup>
                {reservaciones.map((reservacion) => {
                  // Buscar el nombre de la cancha asociada al cancha_id
                  const cancha = canchas.find((cancha) => Number(cancha.id) === Number(reservacion.cancha_id));
                  
                  return (
                    <ListGroup.Item
                      key={reservacion.id}
                      className="d-flex justify-content-between align-items-center list-item-hover"
                    >
                      <div>
                        <strong>Cancha:</strong> {cancha ? cancha.nombre : 'Cancha no encontrada'} <br />
                        <strong>Fecha:</strong> {reservacion.fecha} <br />
                        <strong>Hora de Inicio:</strong> {reservacion.hora_inicio} <br />
                        <strong>Duración:</strong> {reservacion.duracion} <br />
                        <strong>Nombre:</strong> {reservacion.nombre_contacto} <br />
                        <strong>Telefono:</strong> {reservacion.telefono_contacto}
                      </div>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditar(reservacion)}
                      >
                        Modificar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminarReservacion(reservacion.id)}
                      >
                        Eliminar
                      </Button>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Col>
            
            <Col md={6}>
              <h4>{editandoReservacion ? 'Modificar Reservación' : 'Crear Nueva Reservación'}</h4>
              <Form onSubmit={editandoReservacion ? handleModificarReservacion : handleCrearReservacion}>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Cancha</Form.Label>
                  <Form.Select
                    value={nuevaReservacion.cancha_id}
                    onChange={(e) => { 
                      console.log(canchas);
                      console.log('Valor seleccionado:', e.target.value); 
                      setNuevaReservacion({ ...nuevaReservacion, cancha_id: e.target.value })
                    }}
                    required
                  >
                    <option value="">Seleccione una cancha</option>
                    {canchas.map((cancha) => (
                      <option key={cancha.id} value={cancha.id}>
                        {cancha.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={nuevaReservacion.fecha}
                    onChange={(e) =>
                      setNuevaReservacion({ ...nuevaReservacion, fecha: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora de Inicio</Form.Label>
                  <Form.Control
                    type="time"
                    value={nuevaReservacion.hora_inicio}
                    onChange={(e) =>
                      setNuevaReservacion({ ...nuevaReservacion, hora_inicio: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Duración (minutos)</Form.Label>
                  <Form.Control
                    type="number"
                    value={nuevaReservacion.duracion}
                    onChange={(e) =>
                      setNuevaReservacion({ ...nuevaReservacion, duracion: parseInt(e.target.value) })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nombre de Contacto</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaReservacion.nombre_contacto}
                    onChange={(e) =>
                      setNuevaReservacion({ ...nuevaReservacion, nombre_contacto: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono de Contacto</Form.Label>
                  <Form.Control
                    type="tel"
                    value={nuevaReservacion.telefono_contacto}
                    onChange={(e) =>
                      setNuevaReservacion({ ...nuevaReservacion, telefono_contacto: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  {editandoReservacion ? 'Guardar Cambios' : 'Crear Reservación'}
                </Button>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Reservaciones;
