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
  
  // State for collection view
  const [showCollection, setShowCollection] = useState(false);
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
    const storedTime = localStorage.getItem("lastOpened");
    if (storedTime) {
      const lastTime = new Date(storedTime);
      setLastOpened(lastTime);
      updateTimeLeft(lastTime);
    }

    // Cargar colección guardada si existe
    const savedCollection = localStorage.getItem("cardCollection");
    if (savedCollection) {
      setColeccion(JSON.parse(savedCollection));
    }
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
  const manejarAperturaSobre = () => {
    const now = new Date();

    if (lastOpened && now - lastOpened < 60 * 1000 && timeLeft > 0) {
      alert("Debes esperar antes de abrir otro sobre.");
      return;
    }

    setEstaAbriendo(true);
    
    setTimeout(() => {
      const cartaObtenida = getRandomCard();
      
      // Actualizamos la colección
      setColeccion(prevColeccion => 
        prevColeccion.map(carta => 
          carta.id === cartaObtenida.id ? { ...carta, desbloqueada: true } : carta
        )
      );
      
      setCards([cartaObtenida]);
      setPackOpened(true);
      setEstaAbriendo(false);
      setLastOpened(now);
      localStorage.setItem("lastOpened", now.toString());
      updateTimeLeft(now);
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
        {showCollection ? (
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
        ) : (
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
      </div>

      <footer className="footer">
        <button 
          onClick={() => toggleView('collection')}
          className="footer-button"
        >
          <Library size={20} />
          Colección
        </button>
        <button 
          onClick={() => toggleView('packs')}
          className="footer-button"
        >
          <Package size={20} />
          Sobres
        </button>
      </footer>
    </div>
  );
};

export default Chilodex;