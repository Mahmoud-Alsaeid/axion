
const { partialize } = require('../../../libs/utils');
const model = require('./user.model');
module.exports = {
    createUser: [...Object.values(model), {
            path:'confirmPassword',
            required: true,
            label: 'confirmPassword',
            type: 'string',
            customWithData: 'confirmPassword',
            onError: {
                customWithData: 'Passwords should be the same'
            }
    }],
    updateUser: partialize(model)
}


