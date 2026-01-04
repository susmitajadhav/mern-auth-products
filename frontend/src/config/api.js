const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://mern-auth-products.onrender.com";

export { API_BASE_URL };