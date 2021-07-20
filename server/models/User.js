const mongoose = require('mongoose');

// login and resiter data structure
const userSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true}
})

module.exports = mongoose.model('User', userSchema);
