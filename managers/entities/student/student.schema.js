
const { partialize, convertDate } = require('../../../libs/utils');
const model = require('./student.model');
module.exports = {
    createStudent : convertDate(Object.values(model)),//convertDate(partialize(model)),
    updateStudent: convertDate(partialize(model))
    
}

console.log(partialize(model))
