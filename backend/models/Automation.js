const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  trigger: { type: String, required: true }, 
  condition: mongoose.Schema.Types.Mixed, 
  action: mongoose.Schema.Types.Mixed,    
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Automation', automationSchema);
