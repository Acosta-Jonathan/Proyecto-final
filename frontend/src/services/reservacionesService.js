import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const reservacionesService = {
  obtenerReservasPorCanchaYFecha: async (canchaId, fecha) => {
    try {
      const response = await axios.get(`${API_URL}/reservaciones/por_cancha_y_fecha/`, {
        params: { cancha_id: canchaId, fecha: fecha },
      });
      return response.data;
    } catch (error) {
      console.error("Error al consultar las reservas por cancha y fecha:", error);
      throw error;
    }
  },
  
  obtenerReservasPorCancha: async (canchaId) => {
    try {
      const response = await axios.get(`${API_URL}/canchas/${canchaId}/reservas`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas por cancha:", error);
      throw error;
    }
  },
  

  async obtenerReservacionPorId(id) {
    try {
      const response = await axios.get(`${API_URL}/reservaciones/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservación por ID:", error);
      throw error;
    }
  },
  
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
      const response = await axios.post(`${API_URL}/reservaciones/`, reservacion);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Error al crear la reservación");
    }
  },
  
  async modificarReservacion(id, reservacion) {
    try {
      const response = await axios.put(`${API_URL}/reservaciones/${id}`, reservacion);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Error al modificar la reservación");
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

