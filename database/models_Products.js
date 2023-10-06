const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    size: String,
    color: String
});

module.exports = mongoose.model('Product', productSchema);
// Code for new file called models/Product.js  
// We have an array of JSON objects that represents products. 
// We need to save these products into the database and fetch them later.
