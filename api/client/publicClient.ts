import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const baseClientConfig = {
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

export const publicClient = axios.create(baseClientConfig);

export default publicClient;
