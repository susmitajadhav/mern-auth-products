import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import  "../styles/Login.css"

function AuthForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login({
          email: form.email,
          password: form.password,
        });
        alert("Login successful");
        navigate("/products");
      } else {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }
        alert("Registration successful. Please login.");
        setMode("login");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-title">{mode === "login" ? "Login" : "Register"}</h2>
      {mode === "register" && (
        <input
          type="text"
          name="name"
          value={form.name}
          placeholder="Enter your name"
          onChange={handleChange}
          required
        />
      )}

      <input
        type="email"
        name="email"
        value={form.email}
        placeholder="Enter your email"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        value={form.password}
        placeholder="Enter your password"
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading
          ? mode === "login"
            ? "Logging in..."
            : "Registering..."
          : mode === "login"
          ? "Login"
          : "Register"}
      </button>

      {error && <p className="login-error">{error}</p>}
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        {mode === "login" ? (
          <>
            Don’t have an account?{" "}
            <span
              style={{ color: "#4f46e5", cursor: "pointer" }}
              onClick={() => setMode("register")}
            >
              Register
            </span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span
              style={{ color: "#4f46e5", cursor: "pointer" }}
              onClick={() => setMode("login")}
            >
              Login
            </span>
          </>
        )}
      </p>
    </form>
  );
}

export default AuthForm;
