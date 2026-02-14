
 import axios from "axios";

// CHANGE THIS to your laptop IP
const BASE_URL = "http://192.168.31.253:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
