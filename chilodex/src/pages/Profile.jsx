import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    birthdate: "",
    joinDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
          throw new Error("No hay sesión activa");
        }

        // Cargar datos básicos de localStorage
        const localProfile = {
          username: localStorage.getItem("username") || "No disponible",
          email: localStorage.getItem("email") || "No disponible",
          birthdate: localStorage.getItem("birthdate") || "No especificada",
          joinDate: new Date().toLocaleDateString('es-ES')
        };
        setProfile(localProfile);

        // Obtener datos actualizados del backend
        const response = await fetch(`http://localhost:5000/user/${userId}`);
        
        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const serverData = await response.json();
        
        // Actualizar datos del perfil
        const updatedProfile = {
          username: serverData.username || localProfile.username,
          email: serverData.email || localProfile.email,
          birthdate: serverData.birthdate || localProfile.birthdate,
          joinDate: serverData.createdAt 
            ? new Date(serverData.createdAt).toLocaleDateString('es-ES') 
            : localProfile.joinDate
        };
        
        setProfile(updatedProfile);
        
        // Actualizar localStorage
        localStorage.setItem("username", updatedProfile.username);
        localStorage.setItem("email", updatedProfile.email);
        localStorage.setItem("birthdate", updatedProfile.birthdate);

      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
        <button onClick={handleLogout}>Volver al login</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className="profile-details">
        <div className="profile-field">
          <span className="field-label">Nombre de usuario:</span>
          <span className="field-value">{profile.username}</span>
        </div>

        <div className="profile-field">
          <span className="field-label">Correo electrónico:</span>
          <span className="field-value">{profile.email}</span>
        </div>

        <div className="profile-field">
          <span className="field-label">Fecha de nacimiento:</span>
          <span className="field-value">
            {profile.birthdate === "No especificada" 
              ? profile.birthdate 
              : new Date(profile.birthdate).toLocaleDateString('es-ES')}
          </span>
        </div>

        <div className="profile-field">
          <span className="field-label">Miembro desde:</span>
          <span className="field-value">{profile.joinDate}</span>
        </div>
      </div>
    </div>
  );
}