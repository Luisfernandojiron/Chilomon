const express = require("express");
const router = express.Router();
const PokemonCard = require("../models/PokemonCard");
const CollectionCard = require("../models/CollectionCard");

// POST: Abrir sobre (requiere userId desde frontend)
router.post("/open-pack", async (req, res) => {
  try {
    const { userId } = req.body;

    // Obtener 1 carta aleatoria de MongoDB
    const randomCards = await PokemonCard.aggregate([{ $sample: { size: 1 } }]);
    const selectedCard = randomCards[0];

    // Guardar relación usuario <-> carta obtenida
    const newEntry = new CollectionCard({
      userId,
      cardId: selectedCard._id
    });

    await newEntry.save();

    res.status(200).json({
      message: "Carta obtenida correctamente",
      card: selectedCard
    });
  } catch (error) {
    console.error("Error abriendo sobre:", error);
    res.status(500).json({ message: "Error al abrir el sobre" });
  }
});

// GET: Obtener colección del usuario
router.get("/collection/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const collection = await CollectionCard.find({ userId }).populate("cardId");

    const cards = collection.map(entry => entry.cardId); // Devolvemos solo la carta

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error obteniendo colección:", error);
    res.status(500).json({ message: "Error al obtener la colección" });
  }
});

router.get("/history/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const history = await CollectionCard.find({ userId })
      .populate("cardId")
      .sort({ obtainedAt: -1 });

    const formatted = history.map(entry => ({
      nombre: entry.cardId.name,
      fecha: new Date(entry.obtainedAt).toLocaleString(),
      imagen: `/img/chilomones/${entry.cardId.name}.png`
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ message: "Error al obtener el historial" });
  }
});

router.get("/history/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const history = await CollectionCard.find({ userId })
        .populate("cardId")
        .sort({ obtainedAt: -1 });
  
      const formatted = history.map(entry => ({
        nombre: entry.cardId.name,
        fecha: new Date(entry.obtainedAt).toLocaleString(),
        imagen: `/img/chilomones/${entry.cardId.name}.png`
      }));
  
      res.status(200).json(formatted);
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      res.status(500).json({ message: "Error al obtener el historial" });
    }
});

module.exports = router;
