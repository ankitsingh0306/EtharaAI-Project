const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:      { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
    priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate:     { type: Date, default: null },
    tags:        [{ type: String, trim: true }],
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
