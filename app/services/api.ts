
 import axios from "axios";
 import AsyncStorage from "@react-native-async-storage/async-storage";

// CHANGE THIS to your laptop IP
const BASE_URL = "http://192.168.29.11:3000/api";


export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
