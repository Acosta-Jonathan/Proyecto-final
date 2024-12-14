import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const reservacionesService = {
  async obtenerReservaciones() {
    try {
      const respuesta = await axios.get(`${API_URL}/reservaciones/`);
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener reservaciones:', error);
      throw error;
    }
  },

  async crearReservacion(reservacion) {
    try {
      const respuesta = await axios.post(`${API_URL}/reservaciones/`, reservacion);
      return respuesta.data;
    } catch (error) {
      console.error('Error al crear reservación:', error);
      throw error;
    }
  },

  async modificarReservacion(id, reservacion) {
    try {
      const respuesta = await axios.put(`${API_URL}/reservaciones/${id}`, reservacion);
      return respuesta.data;
    } catch (error) {
      console.error('Error al modificar reservación:', error);
      throw error;
    }
  },

  async eliminarReservacion(id) {
    try {
      const respuesta = await axios.delete(`${API_URL}/reservaciones/${id}`);
      return respuesta.data;
    } catch (error) {
      console.error('Error al eliminar reservación:', error);
      throw error;
    }
  }
};

