import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reservacionesService } from "../services/reservacionesService";
import { canchasService } from "../services/canchasService";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

function ModificarReservacion() {
  const { reservaId } = useParams(); // Obtener el ID de la reserva desde la URL
  const [editandoReservacion, setEditandoReservacion] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [nuevaReservacion, setNuevaReservacion] = useState({
    cancha_id: 0,
    fecha: "",
    hora_inicio: "",
    duracion: 0,
    nombre_contacto: "",
    telefono_area: "",
    telefono_numero: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCanchas();
    if (reservaId) {
      cargarReservacionPorId(reservaId);
    }
  }, [reservaId]);

  const cargarCanchas = async () => {
    try {
      const data = await canchasService.obtenerCanchas();
      setCanchas(data);
    } catch (error) {
      console.error("Error al cargar las canchas:", error);
    }
  };

  // Cargar la reserva por ID
  const cargarReservacionPorId = async (id) => {
    try {
      const data = await reservacionesService.obtenerReservacionPorId(id); // Obtener los datos de la reserva desde el backend
      console.log("Datos de la reserva:", data); // Depuración
      setEditandoReservacion(data);
      setNuevaReservacion({
        cancha_id: data.cancha_id,
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        duracion: data.duracion,
        nombre_contacto: data.nombre_contacto,
        telefono_area: data.telefono_area,
        telefono_numero: data.telefono_numero,
      });
    } catch (error) {
      console.error("Error al cargar la reservación:", error);
    }
  };

  const handleModificarReservacion = async (e) => {
    e.preventDefault();
    try {
      setError(""); // Limpiar error previo
      await reservacionesService.modificarReservacion(
        reservaId,
        nuevaReservacion
      );
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container
      className=" blurred-container mt-5"
      style={{ maxWidth: "600px" }}
    >
      <Card>
        <Card.Header>
          <h2 className="text-center">Modificar Reservación</h2>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Row>
            <Col md={6}>
              <Form onSubmit={handleModificarReservacion}>
                {/* Formulario de modificación de reserva */}
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Cancha</Form.Label>
                  <Form.Control
                    as="select"
                    value={nuevaReservacion.cancha_id}
                    onChange={(e) =>
                      setNuevaReservacion({
                        ...nuevaReservacion,
                        cancha_id: e.target.value,
                      })
                    }
                    required
                  >
                    {canchas.map((cancha) => (
                      <option key={cancha.id} value={cancha.id}>
                        {cancha.nombre}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                {/* Otros campos del formulario */}
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={nuevaReservacion.fecha}
                    onChange={(e) =>
                      setNuevaReservacion({
                        ...nuevaReservacion,
                        fecha: e.target.value,
                      })
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
                      setNuevaReservacion({
                        ...nuevaReservacion,
                        hora_inicio: e.target.value,
                      })
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
                      setNuevaReservacion({
                        ...nuevaReservacion,
                        duracion: parseInt(e.target.value),
                      })
                    }
                    min="15"
                    max="120"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nombre de Contacto</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaReservacion.nombre_contacto}
                    onChange={(e) =>
                      setNuevaReservacion({
                        ...nuevaReservacion,
                        nombre_contacto: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono de Contacto</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="number"
                      placeholder="Código de área"
                      value={nuevaReservacion.telefono_area}
                      onChange={(e) =>
                        setNuevaReservacion({
                          ...nuevaReservacion,
                          telefono_area: e.target.value,
                        })
                      }
                      min="100"
                      max="9999"
                      style={{ width: "120px" }}
                      required
                    />
                    <span className="mx-2 fw-bold">-</span>
                    <Form.Control
                      type="number"
                      placeholder="Número"
                      value={nuevaReservacion.telefono_numero}
                      onChange={(e) =>
                        setNuevaReservacion({
                          ...nuevaReservacion,
                          telefono_numero: e.target.value,
                        })
                      }
                      min="100000"
                      max="99999999"
                      required
                    />
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Modificar Reservación
                </Button>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ModificarReservacion;
