const mongoose = require("mongoose");

const pokemonCardSchema = new mongoose.Schema({
  cardId: String,
  name: String,
  type: {
    primary: String,
    secondary: String
  },
  rarity: String,
  pokedexNumber: Number,
  setCode: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model("PokemonCard", pokemonCardSchema);
