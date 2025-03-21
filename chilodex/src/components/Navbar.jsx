import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="main-navbar">
      <ul className="navbar-list">
        <li className="navbar-item"><Link className="navbar-link" to="/">Inicio</Link></li>
        <li className="navbar-item"><Link className="navbar-link" to="/login">Iniciar Sesión</Link></li>
        <li className="navbar-item"><Link className="navbar-link" to="/register">Registrarse</Link></li>
        <li className="navbar-item"><Link className="navbar-link" to="/chilodex">Chilodex</Link></li>
        <li className="navbar-item"><Link className="navbar-link" to="/profile">Perfil</Link></li>
      </ul>
    </nav>
  );
}