
module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 }
    },
    username: {
        path: 'username',
        type: 'string',
        length: {min: 3, max: 20},
        required: true
    },
    password: {
        path: 'password',
        type: 'string',
        length: {min: 8, max: 100},
        required: true,
        select: false
    },
    email: {
        path: 'email',
        type: 'string',
        length: {min:3, max: 100},  
        required: true,
        unique: true
    },
    role: {
        path:'role',
        type: 'string',
        oneOf: ['superadmin', 'schooladmin'],
        default: 'schooladmin',
      },
}