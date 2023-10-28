
const { partialize } = require('../../../libs/utils');
const model = require('./school.model');
module.exports = {
    UpdateSchool: partialize(model)
}


