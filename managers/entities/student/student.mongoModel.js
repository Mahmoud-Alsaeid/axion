const mongoose      = require('mongoose');
const model = require('./student.model');
const StudentModel = mongoose.model('Student',new mongoose.Schema({...model,
  classroom: [{
        path: 'classroom',
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassRoom',
      }],
}));

module.exports = StudentModel;