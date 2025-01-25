const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    mobile: {
        type: String,
        trim: true
    },
    address: {
        type: String
    }
}); // Explicitly specify 'user' as the collection name

module.exports = mongoose.model('Client', authSchema);
