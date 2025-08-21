import { useState, useEffect } from 'react';
import { Package, Sparkles, Library } from 'lucide-react';
import "./Chilodex.css";

const Chilodex = () => {
  // States for pack opening functionality
  const [estaAbriendo, setEstaAbriendo] = useState(false);
  const [packOpened, setPackOpened] = useState(false);
  const [cards, setCards] = useState([]);
  const [lastOpened, setLastOpened] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [historial, setHistorial] = useState([]);

  
  // State for collection view
  const [vistaActual, setVistaActual] = useState("packs");
  const [coleccion, setColeccion] = useState([
    { id: 1, nombre: 'Mauffin', imagen: '/img/chilomones/Mauffin.png', desbloqueada: false },
    { id: 2, nombre: 'Noctuffin', imagen: '/img/chilomones/Noctuffin.png', desbloqueada: false },
    { id: 3, nombre: 'Nuttrock', imagen: '/img/chilomones/Nuttrock (1).png', desbloqueada: false },
    { id: 4, nombre: 'Puffin', imagen: '/img/chilomones/Puffin.png', desbloqueada: false },
    { id: 5, nombre: 'Stormequus', imagen: '/img/chilomones/Stormequus.png', desbloqueada: false },
    { id: 6, nombre: 'Terranut', imagen: '/img/chilomones/Terranut.png', desbloqueada: false },
    { id: 7, nombre: 'Terri', imagen: '/img/chilomones/Terri.png', desbloqueada: false },
    { id: 8, nombre: 'Voltacorn', imagen: '/img/chilomones/Voltacorn.png', desbloqueada: false },
    // Espacios vacíos (22 en total para completar 30)
    ...Array.from({ length: 22 }, (_, i) => ({ 
      id: 9 + i, 
      nombre: 'Carta no disponible', 
      imagen: '', 
      desbloqueada: false 
    }))
  ]);

  // Effect to get the last opened time from localStorage
  useEffect(() => {
    const fetchCollection = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
  
      try {
        const res = await fetch(`http://localhost:5000/cards/collection/${userId}`);
        const data = await res.json();
  
        if (res.ok) {
          const nombresDesbloqueados = data.map(card => card.name);
          setColeccion(prev =>
            prev.map(c =>
              nombresDesbloqueados.includes(c.nombre)
                ? { ...c, desbloqueada: true }
                : c
            )
          );
        }
      } catch (error) {
        console.error("Error cargando colección:", error);
      }
    };
  
    fetchCollection();
  }, []);
  

  // Effect to save collection when it changes
  useEffect(() => {
    localStorage.setItem("cardCollection", JSON.stringify(coleccion));
  }, [coleccion]);

  // Effect to count down the timer
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  const cargarHistorial = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
  
    try {
      const res = await fetch(`http://localhost:5000/cards/history/${userId}`);
      const data = await res.json();
  
      if (res.ok) {
        setHistorial(data);
      }
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  };
  
  // Function to update the time left for cooldown
  const updateTimeLeft = (lastTime) => {
    const now = new Date();
    const elapsed = Math.floor((now - lastTime) / 1000);
    const cooldown = 60; // ⏳ Espera de 1 minuto (60 segundos)
    const remaining = cooldown - elapsed;

    setTimeLeft(remaining > 0 ? remaining : 0);
  };

  // Función mejorada para selección aleatoria con distribución uniforme
  const getRandomCard = () => {
    // Cartas disponibles (primeras 8)
    const availableCards = coleccion.slice(0, 8);
    
    // Filtramos cartas no desbloqueadas (opcional)
    const unopenedCards = availableCards.filter(c => !c.desbloqueada);
    
    // Usamos las no desbloqueadas si hay, sino todas disponibles
    const pool = unopenedCards.length > 0 ? unopenedCards : availableCards;
    
    // Generación aleatoria más robusta
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const randomIndex = randomBuffer[0] % pool.length;
    
    return { ...pool[randomIndex] }; // Devolvemos una copia
  };

  // Function to handle pack opening with cooldown
  const manejarAperturaSobre = async () => {
    const now = new Date();
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      alert("Debes iniciar sesión para abrir sobres");
      return;
    }
  
    if (lastOpened && now - lastOpened < 60 * 1000 && timeLeft > 0) {
      alert("Debes esperar antes de abrir otro sobre.");
      return;
    }
  
    setEstaAbriendo(true);
  
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:5000/cards/open-pack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Error al abrir sobre");
        }
  
        const cartaObtenida = data.card;
  
        // Marcar carta como desbloqueada en UI
        setColeccion(prev =>
          prev.map(c =>
            c.nombre === cartaObtenida.name ? { ...c, desbloqueada: true } : c
          )
        );
  
        setCards([{ nombre: cartaObtenida.name, imagen: `/img/chilomones/${cartaObtenida.name}.png` }]);
        setPackOpened(true);
        setLastOpened(now);
        localStorage.setItem("lastOpened", now.toString());
        updateTimeLeft(now);
      } catch (err) {
        console.error("Error:", err);
        alert("Error al abrir el sobre");
      } finally {
        setEstaAbriendo(false);
      }
    }, 1500);
  };

  // Function to reset to unopened pack state
  const manejarReinicio = () => {
    setPackOpened(false);
  };

  // Function to toggle between collection and packs view
  const toggleView = (view) => {
    if (view === 'collection') {
      setShowCollection(true);
      setPackOpened(false);
    } else {
      setShowCollection(false);
    }
  };

  return (
    <div className="chilodex-container">
      <header className="header">
        <h1>Chilodex</h1>
        <p>Aquí puedes abrir sobres y ver tu colección de cartas.</p>
      </header>
  
      <div className="content">
        {/* Vista: Colección */}
        {vistaActual === "collection" && (
          <div className="collection-section">
            <h2>Tu Colección</h2>
            <div className="cards-grid">
              {coleccion.map((carta) => (
                <div
                  key={carta.id}
                  className={`card-item ${carta.desbloqueada ? 'unlocked' : 'locked'} ${!carta.imagen ? 'empty' : ''}`}
                >
                  {carta.imagen && carta.desbloqueada ? (
                    <img 
                      src={carta.imagen} 
                      alt={carta.nombre} 
                      className="card-image"
                    />
                  ) : (
                    <div className="card-placeholder">
                      {carta.imagen ? (
                        <span className="card-locked">🔒</span>
                      ) : (
                        <span className="card-empty">✖</span>
                      )}
                    </div>
                  )}
                  <div className="card-name">{carta.nombre}</div>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Vista: Sobres */}
        {vistaActual === "packs" && (
          <div className="pack-section">
            {!packOpened ? (
              <div className="text-center">
                <div className="pack-image-container">
                  <img
                    src="/img/610.webp"
                    alt="Sobre"
                    className="pack-image"
                  />
                </div>
                <div className="button-container">
                  <button
                    onClick={manejarAperturaSobre}
                    disabled={estaAbriendo || timeLeft > 0}
                    className="open-button"
                  >
                    {estaAbriendo ? (
                      <>
                        <Sparkles className="animate-spin" size={20} />
                        Abriendo...
                      </>
                    ) : timeLeft > 0 ? (
                      <>
                        <Sparkles size={20} />
                        Espera {timeLeft}s
                      </>
                    ) : (
                      <>
                        <Package size={20} />
                        Abrir Sobre
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="collection-section">
                <h2>¡Carta obtenida!</h2>
                <div className="opened-card-container">
                  {cards.map((carta) => (
                    <div
                      key={carta.id}
                      className="opened-card"
                    >
                      <img 
                        src={carta.imagen} 
                        alt={carta.nombre} 
                        className="card-image-large"
                      />
                      <div className="card-name">{carta.nombre}</div>
                    </div>
                  ))}
                </div>
                <div className="button-container">
                  <button
                    onClick={manejarReinicio}
                    className="back-button"
                  >
                    Volver
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
  
        {/* Vista: Historial */}
        {vistaActual === "history" && (
          <div className="history-section">
            <h2>Historial de sobres abiertos</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item, index) => (
                  <tr key={index}>
                    <td><img src={item.imagen} alt={item.nombre} width={60} /></td>
                    <td>{item.nombre}</td>
                    <td>{item.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-container">
              <button
                onClick={() => setVistaActual("packs")}
                className="back-button"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
  
      {/* Footer con navegación */}
      <footer className="footer">
        <button 
          onClick={() => setVistaActual("collection")}
          className="footer-button"
        >
          <Library size={20} />
          Colección
        </button>
        <button 
          onClick={() => setVistaActual("packs")}
          className="footer-button"
        >
          <Package size={20} />
          Sobres
        </button> 
        <button 
          onClick={async () => {
            await cargarHistorial();
            setVistaActual("history");
          }}
          className="footer-button"
        >
          <Sparkles size={20} />
          Ver Historial
        </button>
      </footer>
    </div>
  );  
};

export default Chilodex;