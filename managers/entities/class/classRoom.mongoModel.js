const mongoose      = require('mongoose');
const model = require('./classRoom.model');
const ClassRoomModel = mongoose.model('ClassRoom',new mongoose.Schema({...model,
  school: {
    path: 'school',
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
}));

module.exports = ClassRoomModel;