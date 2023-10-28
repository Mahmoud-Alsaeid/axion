
const { partialize } = require('../../../libs/utils');
const model = require('./classRoom.model');
module.exports = {
    updateClassRoom: partialize(model)
}


