import axios from 'axios';



export const api = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades',

});

export const getMunicipios = async () => {
  try {
    const response = await api.get('/municipios');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter municipios:', error);
    throw error;
  }
};

export const getEstados = async (UF: string ) => {
  try {
    const response = await api.get(`/estados/${UF}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter estados:', error);
    throw error;
  }
}

//:TODO - Fazer o getMunicipios por UF no LocationMap.tsx