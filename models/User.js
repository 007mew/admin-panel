const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // For hashing passwords

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Ensure username is unique
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  }
});

// Hash password before saving to DB
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // Only hash if password is new or modified
  this.password = await bcrypt.hash(this.password, 10);  // Hash the password with a salt
  next();
});

// Method to compare hashed password during login
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
