const mongoose = require("mongoose");

const collectionCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "PokemonCard", required: true },
  obtainedAt: { type: Date, default: Date.now }
});

// 👇 Esto es lo importante
module.exports = mongoose.model("CollectionCard", collectionCardSchema, "collectioncards");
