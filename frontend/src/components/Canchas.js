import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Card } from 'react-bootstrap';
import { canchasService } from '../services/canchasService';
import 'bootstrap/dist/css/bootstrap.min.css';

function Canchas() {
  const [canchas, setCanchas] = useState([]);
  const [nuevaCancha, setNuevaCancha] = useState({ nombre: '', techada: false });

  useEffect(() => {
    cargarCanchas();
  }, []);

  const cargarCanchas = async () => {
    try {
      const data = await canchasService.obtenerCanchas();
      setCanchas(data);
    } catch (error) {
      console.error('Error al cargar canchas', error);
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

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h2 className="text-center">Gestión de Canchas</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4>Listado de Canchas</h4>
              <ListGroup>
                {canchas.map(cancha => (
                  <ListGroup.Item 
                    key={cancha.id} 
                    className="d-flex justify-content-between align-items-center"
                  >
                    {cancha.nombre}
                    <span className={`badge ${cancha.techada ? 'bg-success' : 'bg-warning'}`}>
                      {cancha.techada ? 'Techada' : 'Descubierta'}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col md={6}>
              <h4>Crear Nueva Cancha</h4>
              <Form onSubmit={handleCrearCancha}>
                <Form.Group className="mb-3">
                  <Form.Control 
                    type="text" 
                    placeholder="Nombre de la cancha" 
                    value={nuevaCancha.nombre}
                    onChange={(e) => setNuevaCancha({...nuevaCancha, nombre: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox" 
                    label="Cancha Techada" 
                    checked={nuevaCancha.techada}
                    onChange={(e) => setNuevaCancha({...nuevaCancha, techada: e.target.checked})}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Crear Cancha
                </Button>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Canchas;