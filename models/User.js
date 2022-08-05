
// Used mongoose to create  a module to enable us 
//to communicate with our database

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,

    // checked the validity
    verified: Boolean
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
