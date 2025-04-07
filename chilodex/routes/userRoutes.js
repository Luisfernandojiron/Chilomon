const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/user/:id', async (req, res) => {
  try {
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    // Buscar usuario
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Preparar respuesta
    const userData = {
      username: user.username,
      email: user.email,
      birthdate: user.birthdate.toISOString().split('T')[0],
      createdAt: user.createdAt
    };

    res.status(200).json(userData);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;