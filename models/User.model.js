const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required.']
  }
}, {
  timestamps: true
});

const User = model("User", userSchema)

module.exports = User;