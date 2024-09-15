const mongoose = require("mongoose");

const Schema = require('mongoose').Schema

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

const orderSchema = new Schema({
    user: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
    },
    address: addressSchema,
    cart: {
        type: Object,
        required: true
    },
    date: { type: Date, default: Date.now },
    status: Object
});


module.exports = mongoose.model("order", orderSchema);