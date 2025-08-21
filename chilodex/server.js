const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const cardRoutes = require('./routes/cardRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/cards", cardRoutes);

// Conexión a MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/chilodex", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// Ruta de Registro
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, birthdate } = req.body;

    // Validación básica
    if (!username || !email || !password || !birthdate) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? "El correo electrónico ya está registrado" 
          : "El nombre de usuario ya está en uso"
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      birthdate: new Date(birthdate) 
    });

    await newUser.save();
    
    // Respuesta exitosa con datos del usuario (sin password)
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      birthdate: newUser.birthdate.toISOString().split('T')[0],
      createdAt: newUser.createdAt
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta de Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Respuesta exitosa con datos del usuario
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      userId: user._id,
      username: user.username,
      email: user.email,
      birthdate: user.birthdate.toISOString().split('T')[0],
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta para obtener datos del usuario (para el perfil)
app.get("/user/:id", async (req, res) => {
  try {
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    // Buscar usuario (excluyendo la contraseña)
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Formatear respuesta
    const userData = {
      username: user.username,
      email: user.email,
      birthdate: user.birthdate.toISOString().split('T')[0],
      createdAt: user.createdAt
    };

    res.status(200).json(userData);

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Chilodex funcionando correctamente");
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});