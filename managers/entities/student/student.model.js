module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 }
    },
    name: {
        path: 'name',
        type: 'string',
        length: {min: 3, max: 40},
        required: true
    },
    dateOfBirth: {
        path: 'dateOfBirth',
        type: 'Date',
        required: true,
    },
    gender: {
        path: 'gender',
        type: 'string',
        oneOf: ['Male', 'Female'],
        required: true
    },
    phoneNumber: {
        path: 'phoneNumber',
        type: 'string',
    },
    email: {
        path: 'email',
        type: 'string',
        required: true,
        unique: true
    },
    address: {
        path: 'address',
        type: 'string',
        length: { min: 5, max: 100 },
        required: true
    },
    parentName: {
        path: 'parentName',
        type: 'string',
        length: { min: 3, max: 40 },
        required: true
    },
    parentPhoneNumber: {
        path: 'parentPhoneNumber',
        type: 'string',
        required: true,
    },
    enrollmentDate: {
        path: 'enrollmentDate',
        type: 'Date',
        required: true
    }
}