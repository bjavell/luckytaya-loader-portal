
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const localAxios: AxiosInstance = axios.create({

})


localAxios.interceptors.request.use(
    (config) => {
        const correlationId = config.headers['X-Correlation-ID'] || uuidv4();
        config.headers['X-Correlation-ID'] = correlationId;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export {
    localAxios
}