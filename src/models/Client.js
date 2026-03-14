const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  label: {
    type: String,
    default: 'Mobile'
  },
  number: {
    type: String,
    required: true
  }
}, { _id: true });

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phones: {
    type: [phoneSchema],
    default: [{ label: 'Mobile', number: '' }]
  },
  address: {
    type: String,
    required: false
  },
  birthday: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  customFields: {
    type: Map,
    of: String,
    default: {}
  },
  relationships: [{
    name: {
      type: String,
      required: true
    },
    relation: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', clientSchema);