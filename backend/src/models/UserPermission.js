const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  permissions: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPermission', userPermissionSchema);
