// chilodex/models/pokemoncard.js
const mongoose = require('mongoose');

const pokemonCardSchema = new mongoose.Schema({
  cardId: { // ID específico de la carta (ej: ST1-054)
    type: String,
    required: true,
    unique: true // Asumiendo que este ID es único por carta
  },
  name: {
    type: String,
    required: true,
    index: true // Indexar por nombre puede ser útil para búsquedas
  },
  type: {
    primary: { type: String, required: true },
    secondary: { type: String, default: null }
  },
  rarity: {
    type: String,
    required: true
  },
  pokedexNumber: { // Número de Pokédex o identificador numérico
    type: Number,
    required: true,
    unique: true // Asumiendo que es único
  },
  setCode: { // Código del set al que pertenece
    type: String,
    required: true
  },
  description: {
    type: String
  },
  // Puedes añadir un campo para la ruta de la imagen si la guardas
  // imagePath: { type: String }
}, { timestamps: true }); // timestamps añade createdAt y updatedAt automáticamente

const PokemonCard = mongoose.model('PokemonCard', pokemonCardSchema);

module.exports = PokemonCard;
