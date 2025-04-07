// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav className="main-navbar">
      <ul className="navbar-list">
        <li className="navbar-item"><Link className="navbar-link" to="/">Inicio</Link></li>
        {!isAuthenticated ? (
          <li className="navbar-item"><Link className="navbar-link" to="/auth">Iniciar Sesión</Link></li>
        ) : (
          <>
            <li className="navbar-item"><Link className="navbar-link" to="/chilodex">Chilodex</Link></li>
            <li className="navbar-item"><Link className="navbar-link" to="/profile">Perfil</Link></li>
            <li className="navbar-item">
              <button 
                className="navbar-link" 
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
              >
                Cerrar Sesión
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}