const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    size: String,
    color: String
});

module.exports = mongoose.model('Product', productSchema);
// file name models/Product.js
