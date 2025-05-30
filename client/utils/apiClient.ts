import axios, { AxiosInstance } from 'axios';

import getConfig from './getConfig';

const ROOT_URL: string = getConfig('API_URL') ?? '';

/**
 * Configures an Axios instance with the correct API URL
 */
function createClientInstance(): AxiosInstance {
  return axios.create({
    baseURL: ROOT_URL,
    withCredentials: true
  });
}

export default createClientInstance();
