import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './Auth.css';

export default function Auth() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    birthdate: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const endpoint = isLogin ? "login" : "register";
    const requestData = isLogin ? {
      email: formData.email,
      password: formData.password
    } : formData;

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          // Guardamos datos relevantes en localStorage
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("username", data.username || formData.username);
          localStorage.setItem("email", data.email || formData.email);
          
          login(data.userId); // Actualiza el estado de autenticación
          navigate("/"); // Redirige al home
        } else {
          setMessage("¡Registro exitoso! Por favor inicia sesión.");
          setIsLogin(true); // Cambia automáticamente a vista de login
          // Resetear el formulario
          setFormData({
            username: "",
            email: "",
            password: "",
            birthdate: "",
          });
        }
      } else {
        setMessage(data.message || "Error en la solicitud");
      }
    } catch (error) {
      setMessage("Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h1>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
          </>
        )}
        
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrarse")}
        </button>
      </form>
      
      <p className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
        {isLogin 
          ? "¿No tienes cuenta? Regístrate aquí" 
          : "¿Ya tienes cuenta? Inicia sesión aquí"}
      </p>
      
      {message && (
        <p className={`auth-message ${message.includes("éxito") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
}