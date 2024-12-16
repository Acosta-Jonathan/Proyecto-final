import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { canchasService } from '../services/canchasService';
import { reservacionesService } from '../services/reservacionesService';
import 'bootstrap/dist/css/bootstrap.min.css';

function Canchas() {
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarCanchas() {
        const data = await canchasService.obtenerCanchas();
        setCanchas(data);
    }
    cargarCanchas();
  }, []);

  const cargarReservas = async (canchaId) => {
    try {
      console.log("Cancha seleccionada:", canchaId); // Verifica el ID de la cancha
      const data = await reservacionesService.obtenerReservasPorCancha(canchaId);
      console.log("Reservas cargadas:", data); // Verifica las reservas obtenidas
      setReservas(data);
      setCanchaSeleccionada(canchas.find(cancha => cancha.id === canchaId));
    } catch (error) {
      console.error('Error al cargar reservas', error);
    }
  };
  

  const handleCrearCancha = async (e) => {
    e.preventDefault();
    try {
      await canchasService.crearCancha(nuevaCancha);
      cargarCanchas();
      setNuevaCancha({ nombre: '', techada: false });
    } catch (error) {
      console.error('Error al crear cancha', error);
    }
  };

  const handleSeleccionarCancha = (canchaId) => {
    navigate(`/reservaciones/${canchaId}`); // Redirige al componente de Reservaciones.js con el ID de la cancha
  };

  // const handleSeleccionarCancha = async (canchaId) => {
  //     setCanchaSeleccionada(canchaId);
  //     const data = await reservacionesService.obtenerReservasPorCancha(canchaId);
  //     setReservas(data);
  // };

  const handleModificarReserva = (reservaId) => {
      navigate(`/reservas/modificar/${reservaId}`);
  };

  const handleEliminarReserva = async (reservaId) => {
    try {
      await reservacionesService.eliminarReservacion(reservaId);
      if (canchaSeleccionada) {
        cargarReservas(canchaSeleccionada.id); // Recargar reservas de la cancha seleccionada
      }
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
    }
  };
  // <Container className="mt-5">
    //   <Card>
    //     <Card.Header>
    //       <h2 className="text-center">Gestión de Canchas</h2>
    //     </Card.Header>
    //     <Card.Body>
    //       <Row>
    //         <Col md={6}>
    //           <h4>Listado de Canchas</h4>
    //           <ListGroup>
    //             {canchas.map(cancha => (
    //               <ListGroup.Item
    //                 key={cancha.id}
    //                 className="d-flex justify-content-between align-items-center"
    //               >
    //                 {cancha.nombre}
    //                 <span className={`badge ${cancha.techada ? 'bg-success' : 'bg-warning'}`}>
    //                   {cancha.techada ? 'Techada' : 'Descubierta'}
    //                 </span>
    //               </ListGroup.Item>
    //             ))}
    //           </ListGroup>
    //         </Col>
    //         <Col md={6}>
    //           <h4>Crear Nueva Cancha</h4>
    //           <Form onSubmit={handleCrearCancha}>
    //             <Form.Group className="mb-3">
    //               <Form.Control
    //                 type="text"
    //                 placeholder="Nombre de la cancha"
    //                 value={nuevaCancha.nombre}
    //                 onChange={(e) => setNuevaCancha({...nuevaCancha, nombre: e.target.value})}
    //                 required
    //               />
    //             </Form.Group>
    //             <Form.Group className="mb-3">
    //               <Form.Check
    //                 type="checkbox"
    //                 label="Cancha Techada"
    //                 checked={nuevaCancha.techada}
    //                 onChange={(e) => setNuevaCancha({...nuevaCancha, techada: e.target.checked})}
    //               />
    //             </Form.Group>
    //             <Button variant="primary" type="submit">
    //               Crear Cancha
    //             </Button>
    //           </Form>
    //         </Col>
    //       </Row>
    //     </Card.Body>
    //   </Card>
    // </Container>
  return (
    <div className="container mt-5">
      <h4>Lista de Canchas</h4>
      <ListGroup>
        {canchas.map((cancha) => (
          <ListGroup.Item
            key={cancha.id}
            onClick={() => cargarReservas(cancha.id)}
            className="list-item-hover"
          >
            {cancha.nombre} {cancha.techada ? "(Techada)" : "(No Techada)"}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {canchaSeleccionada && (
        <div className="mt-4">
          <h5>Reservas para: {canchaSeleccionada.nombre}</h5>
          {reservas.length > 0 ? (
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
                    <strong>Contacto:</strong> {reserva.nombre_contacto} - {reserva.telefono_contacto}
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
            <p>No hay reservas para esta cancha.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Canchas;