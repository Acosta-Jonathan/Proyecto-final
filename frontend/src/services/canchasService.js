import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const canchasService = {
  async obtenerCanchas() {
    try {
      const respuesta = await axios.get(`${API_URL}/canchas/`);
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener canchas:', error);
      throw error;
    }
  },

  obtenerCanchaPorId: async (id) => {
    const response = await fetch(`${API_URL}/canchas/${id}`);
    if (!response.ok) {
      throw new Error("No se pudo obtener la cancha");
    }
    return response.json();
  },
  
  async crearCancha(cancha) {
    try {
      const respuesta = await axios.post(`${API_URL}/canchas/`, cancha);
      return respuesta.data;
    } catch (error) {
      console.error('Error al crear cancha:', error);
      throw error;
    }
  }
};