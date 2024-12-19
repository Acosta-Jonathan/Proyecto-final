import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { canchasService } from "../services/canchasService";
import { reservacionesService } from "../services/reservacionesService";

function CrearReservacion() {
  const { canchaId } = useParams(); // Obtiene el ID de la cancha desde la URL
  const [canchaNombre, setCanchaNombre] = useState(""); // Guarda el nombre de la cancha
  const [reserva, setReserva] = useState({
    fecha: "",
    hora_inicio: "",
    duracion: 15,
    nombre_contacto: "",
    telefono_area: "",
    telefono_numero: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    // Obtener el nombre de la cancha usando el ID
    const cargarCancha = async () => {
      try {
        const cancha = await canchasService.obtenerCanchaPorId(canchaId);
        setCanchaNombre(cancha.nombre);
      } catch (error) {
        console.error("Error al cargar la cancha:", error);
      }
    };
    cargarCancha();
  }, [canchaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReserva(prev => ({
      ...prev,
      [name]: name === 'duracion' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(""); // Limpiar error previo
      await reservacionesService.crearReservacion({
        ...reserva,
        cancha_id: parseInt(canchaId),
        duracion: parseInt(reserva.duracion)
      });
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div
      className="container blurred-container mt-5"
      style={{ maxWidth: "600px" }}
    >
      <Card>
        <Card.Header>
          <h5>Crear Reservación - Cancha: {canchaNombre}</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="fecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={reserva.fecha}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="hora_inicio" className="mt-3">
              <Form.Label>Hora de Inicio</Form.Label>
              <Form.Control
                type="time"
                name="hora_inicio"
                value={reserva.hora_inicio}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="duracion" className="mt-3">
              <Form.Label>Duración (minutos)</Form.Label>
              <Form.Control
                type="number"
                name="duracion"
                value={reserva.duracion}
                onChange={handleChange}
                min="15"
                max="120"
                required
              />
            </Form.Group>

            <Form.Group controlId="nombre_contacto" className="mt-3">
              <Form.Label>Nombre de Contacto</Form.Label>
              <Form.Control
                type="text"
                name="nombre_contacto"
                value={reserva.nombre_contacto}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Teléfono de Contacto</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="number"
                  name="telefono_area"
                  placeholder="Cód área"
                  value={reserva.telefono_area}
                  onChange={handleChange}
                  min="100"
                  max="9999"
                  style={{ width: "120px" }}
                  required
                />
                <span className="mx-2 fw-bold">-</span>
                <Form.Control
                  type="number"
                  name="telefono_numero"
                  placeholder="Número"
                  value={reserva.telefono_numero}
                  onChange={handleChange}
                  min="100000"
                  max="99999999"
                  required
                />
              </div>
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-4">
              Crear Reservación
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CrearReservacion;
