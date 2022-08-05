
// Used mongoose to create  a module to enable us 
//to communicate with our database

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerificationSchema = new Schema({
    UniqueId: String,
    UniqueString: String,
    createAt: Date,
    expireAt: Date,


});


const UserVerfication = mongoose.model('UserVerfication', UserVerificationSchema);

module.exports = UserVerfication;
