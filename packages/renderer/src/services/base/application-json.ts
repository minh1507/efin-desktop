import axios from 'axios';

const applicationJson = axios.create({
  baseURL: 'http://localhost:4200/api/v1/stc/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default applicationJson;
