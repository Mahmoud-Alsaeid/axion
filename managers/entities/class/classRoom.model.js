module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 }
    },
    name: {
        path: 'name',
        type: 'string',
        length: {min: 2, max: 20},
        required: true
    },
    capacity: {
        path: 'capacity',
        type: 'number',
        required: true,
    },
    location: {
        path: 'location',
        type: 'string',
        length: { min: 5, max: 100 },
        required: true
    },
    
    
}