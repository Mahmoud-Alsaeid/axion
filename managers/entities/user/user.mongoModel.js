const mongoose      = require('mongoose');
const model = require('./user.model');
const UserModel = mongoose.model('User',new mongoose.Schema(model));

module.exports = UserModel;