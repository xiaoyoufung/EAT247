const mongoose = require('mongoose');

// admin schema
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const addressSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phone: String,
    address: String,
    city: String,
    postcode: String,
    lat: Number,
    lon: Number
})

// user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    addresses: [addressSchema]
});


exports.Admin = mongoose.model("admin", adminSchema);
exports.User = mongoose.model("user", userSchema);
exports.Address = mongoose.model("address", addressSchema);


// if sigle model use this vvvv
// module.exports = mongoose.model("user", userSchema);