import axios from 'axios';

class API {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000', // Your backend base URL
    });
  }

  getApiInstance() {
    return this.api;
  }
}

export default new API();
