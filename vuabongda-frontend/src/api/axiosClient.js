import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Tu dong gan JWT
axiosClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("vb_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // Neu la FormData thi de browser tu tao
    // multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;