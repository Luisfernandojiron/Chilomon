// chilodex/controllers/pokemoncards.controller.js
const PokemonCard = require('../models/pokemoncard');
const UserCardCollection = require('../models/collectioncardsforusers');
// const User = require('../models/user'); // Descomenta si necesitas validar el usuario aquí

// Obtener todas las cartas (opcional)
exports.getAllCards = async (req, res) => {
  try {
    const cards = await PokemonCard.find().sort({ pokedexNumber: 1 });
    res.json(cards);
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({ message: "Error al obtener las cartas: " + error.message });
  }
};

// Obtener una carta aleatoria
exports.getRandomCard = async (req, res) => {
  try {
    const count = await PokemonCard.countDocuments();
    if (count === 0) {
        return res.status(404).json({ message: 'No hay cartas disponibles.' });
    }
    const random = Math.floor(Math.random() * count);
    const randomCard = await PokemonCard.findOne().skip(random);

    if (!randomCard) {
         return res.status(404).json({ message: 'No se pudo encontrar una carta aleatoria.' });
    }
    res.json(randomCard);
  } catch (error) {
    console.error("Error fetching random card:", error);
    res.status(500).json({ message: "Error al obtener carta aleatoria: " + error.message });
  }
};

// Añadir carta a la colección del usuario
exports.addCardToUserCollection = async (req, res) => {
  const loggedInUserId = req.user?._id; // Asume que el middleware auth añade req.user
  const { userId, cardId } = req.body;

  if (!userId || !cardId) {
      return res.status(400).json({ message: 'Faltan userId o cardId' });
  }

  // *** Seguridad Crítica ***: Validar que el usuario logueado es quien dice ser
  if (!loggedInUserId || loggedInUserId.toString() !== userId) {
      return res.status(403).json({ message: 'No autorizado.' });
  }

  try {
    const cardExists = await PokemonCard.findById(cardId);
    if (!cardExists) {
        return res.status(404).json({ message: 'La carta especificada no existe.' });
    }

    // Intenta crear la entrada. Si ya existe (por el índice unique), fallará o no hará nada si usas upsert.
    // Usaremos findOneAndUpdate con upsert para manejar esto limpiamente.
    const newCollectionItem = await UserCardCollection.findOneAndUpdate(
      { userId: userId, cardId: cardId },
      { $setOnInsert: { userId: userId, cardId: cardId, obtainedAt: new Date() } },
      { new: true, upsert: true, runValidators: true }
    );

    await newCollectionItem.populate('cardId'); // Poblar con datos de la carta

    res.status(201).json({
        message: 'Carta añadida (o ya existente) en la colección.',
        collectionEntry: newCollectionItem // Devuelve la entrada de la colección (con la carta poblada)
    });

  } catch (error) {
    console.error("Error adding card to collection:", error);
    if (error.code === 11000) { // Código de error de duplicado de MongoDB
        // Esto no debería ocurrir con findOneAndUpdate + upsert, pero es bueno tenerlo por si acaso
         try {
            // Si ya existe, simplemente busca la entrada y devuélvela
            const existingItem = await UserCardCollection.findOne({ userId: userId, cardId: cardId }).populate('cardId');
            return res.status(200).json({ message: 'El usuario ya tiene esta carta.', collectionEntry: existingItem });
        } catch (findError) {
            return res.status(500).json({ message: "Error al verificar carta existente: " + findError.message });
        }
    }
    res.status(500).json({ message: "Error al añadir carta a la colección: " + error.message });
  }
};

// Obtener la colección de un usuario
exports.getUserCollection = async (req, res) => {
  const loggedInUserId = req.user?._id;
  const { userId } = req.params;

  // *** Seguridad ***: Verificar permisos
  if (!loggedInUserId || loggedInUserId.toString() !== userId) {
      return res.status(403).json({ message: 'No autorizado para ver esta colección.' });
  }

  try {
    // Busca todas las entradas de colección para el usuario y popula la información de la carta
    const collection = await UserCardCollection.find({ userId: userId })
      .populate('cardId'); // Reemplaza cardId con el documento PokemonCard completo

    // Mapea para devolver solo los objetos PokemonCard
    const userCards = collection.map(item => item.cardId).filter(card => card != null); // Filtra por si alguna referencia está rota

    res.json(userCards); // Devuelve array de objetos PokemonCard

  } catch (error) {
    console.error("Error fetching user collection:", error);
    res.status(500).json({ message: "Error al obtener la colección del usuario: " + error.message });
  }
};
