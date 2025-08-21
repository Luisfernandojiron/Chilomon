// chilodex/models/collectioncardsforusers.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userCardCollectionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, // Referencia al _id del modelo User
    ref: 'User', // Nombre del modelo al que se refiere (asegúrate que tu modelo de usuario se llame 'User')
    required: true,
    index: true // Indexar por userId para búsquedas rápidas de colección
  },
  cardId: {
    type: Schema.Types.ObjectId, // Referencia al _id del modelo PokemonCard
    ref: 'PokemonCard', // Nombre del modelo al que se refiere
    required: true
  },
  obtainedAt: { // Opcional: Fecha en que se obtuvo la carta
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // timestamps añade createdAt y updatedAt automáticamente

// Crear un índice compuesto para asegurar que un usuario
// no tenga la misma carta dos veces en la colección.
// Si quisieras permitir múltiples copias de la misma carta, quitarías este índice.
userCardCollectionSchema.index({ userId: 1, cardId: 1 }, { unique: true });

const UserCardCollection = mongoose.model('UserCardCollection', userCardCollectionSchema);

module.exports = UserCardCollection;
