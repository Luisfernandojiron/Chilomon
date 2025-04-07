const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  birthdate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        return value < new Date();
      },
      message: 'La fecha de nacimiento debe ser en el pasado'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para limpiar los datos antes de devolverlos al cliente
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);