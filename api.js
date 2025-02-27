import axios from "axios";

 
const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    accept: "application/json",
    // You can add other common headers here
  },
});

export default customAxios;
