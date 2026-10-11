import axios from 'axios';

// Ganti IP berikut sesuai dengan IP jaringan lokal Anda
export const BASE_URL = 'http://10.0.2.2:3000';

const Api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

export default Api;
