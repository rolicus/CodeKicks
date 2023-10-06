const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const Product = require('./models/Product');

const uri = 'mongodb+srv://rolicus:CodeKicks4550@cluster0.oqn2t2i.mongodb.net/?retryWrites=true&w=majority';

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

// Connect to MongoDB
connect();

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Route to fetch all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Authenticate user with MongoDB
    // This is where we would check the credentials against the database

    // Send response
    res.json({ message: 'Logged in successfully' });
});

// Add to cart route
app.post('/addToCart', async (req, res) => {
    const { productId, productName, size, price } = req.body;

    // Add product to cart or save it to the database
    // This is where we would save the product details to the cart in the database

    // Send response
    res.json({ message: 'Product added to cart' });
});

app.listen(8000, () => {
    console.log("Server started on port 8000");
});
