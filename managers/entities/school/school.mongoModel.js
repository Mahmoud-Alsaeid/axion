const mongoose      = require('mongoose');
const model = require('./school.model');
const SchoolModel = mongoose.model('School',new mongoose.Schema({...model,
    schoolAdmins: [{
        path: 'schoolAdmins',
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
}));

module.exports = SchoolModel;