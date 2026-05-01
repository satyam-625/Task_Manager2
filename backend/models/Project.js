const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    default: '#4a6cf7'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-add owner to members
projectSchema.pre('save', function(next) {
  if (this.isNew && !this.members.includes(this.owner.toString())) {
    this.members.push(this.owner);
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
