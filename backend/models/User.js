const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false   // never return password in queries by default
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  },
  avatar: {
    type: String,
    default: function() {
      return this.name ? this.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'U';
    }
  },
  color: {
    type: String,
    default: function() {
      const colors = ['#e67e22','#27ae60','#8e44ad','#3498db','#e74c3c','#16a085'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Auto-set avatar initials from name
userSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.avatar = this.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
