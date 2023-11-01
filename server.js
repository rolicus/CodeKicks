const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors'); 

app.use(cors());

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'CodeKicks4550', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
}));

// Connect to the database
mongoose.connect("mongodb+srv://rolicus:CodeKicks4550@cluster0.oqn2t2i.mongodb.net/CodeKicks", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.static('images'));

/****************************************/
const usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    address: String,
    email: String,
    password: String,
});

const users = mongoose.model("users", usersSchema);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/home.html');
});

app.post("/signup", function (req, res) {
    let newUsers = new users({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        email: req.body.email,
        password: req.body.password,
    });
    newUsers.save()
        .then(() => {
            res.redirect('/login.html');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error during signup");
        });
});

const shoesSchema = new mongoose.Schema({
    name: String,
    price: String,
    description: String,
    stock: Number, // Add a stock field to your schema
});

const shoes = mongoose.model("shoes", shoesSchema);
/*
app.post("/addShoe", isAuthenticated, async function (req, res) {
    const shoeData = req.body; // Assuming your form fields correspond to the shoe schema
    // Create a new shoe based on the request data
    const newShoe = new shoes(shoeData);
    
    try {
        const savedShoe = await newShoe.save();
        // Redirect to a new page upon successful addition
        res.redirect('/addshoe.html');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding the shoe to the database.");
    }
});
*/
app.post("/addShoe", isAuthenticated, async function (req, res) {
    const shoeData = req.body;
    const stock = parseInt(shoeData.stock);

    // Check if the requested stock is greater than 0
    if (stock <= 0) {
        return res.status(400).send("Stock must be greater than 0.");
    }

    // Create a new shoe and save it to the database
    const newShoe = new shoes(shoeData);
    try {
        const savedShoe = await newShoe.save();

        // Update the available stock for the requested shoe
        savedShoe.stock = stock;
        await savedShoe.save();

        // Add the item to the shopping cart
        let newCartItem = {
            name: savedShoe.name,
            price: savedShoe.price,
            stock,
        };

        // Check if the user has a shopping cart in the session
        req.session.shoppingCart = req.session.shoppingCart || [];

        // Here, you should add a check to see if the item already exists in the cart
        // If it does, update the stock instead of adding a new item
        const existingCartItem = req.session.shoppingCart.find(item => item.name === newCartItem.name);
        if (existingCartItem) {
            existingCartItem.stock += newCartItem.stock;
        } else {
            req.session.shoppingCart.push(newCartItem);
        }

        res.redirect('/addshoe.html');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding the shoe to the database.");
    }
});





app.post('/checkout', (req, res) => {
    // Retrieve cart items from the request
    const { cartItems } = req.body;

    // Calculate the total cost and perform the purchase
    const totalCost = calculateTotalCost(cartItems); // Implement this function
    const stockCheck = validateStock(cartItems); // Implement this function

    if (!stockCheck) {
        return res.status(400).send('Not enough stock available.');
    }

    // Perform the purchase (e.g., update database, clear cart, etc.)
    performPurchase(cartItems); // Implement this function

    // Respond to the client
    res.sendStatus(200);
});



app.get("/shoes", function (req, res) {
    // Fetch shoe data from your database
    shoes.find({}).exec()
    .then((shoes) => {
        // Handle successful retrieval of shoes
        res.json(shoes);
    })
    .catch((err) => {
        // Handle any errors that occur during retrieval
        console.error(err);
        res.status(500).json({ error: "Error fetching shoe data" });
    });
});

app.delete("/deleteShoe/:id", async (req, res) => {
    const shoeId = req.params.id; // Extract the shoe ID from the URL

    try {
        const deletedShoe = await shoes.findByIdAndRemove(shoeId);
        if (deletedShoe) {
            res.sendStatus(200);
        } else {
            res.status(404).send("Shoe not found");
        }
    } catch (err) {
        console.error("Failed to delete the shoe:", err);
        res.status(500).send("Failed to delete the shoe.");
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.authenticated)  {
        next();
    } else {
        res.redirect('/login.html');
    }
}

app.get('/home.html', function (req, res) {
    res.sendFile(__dirname + '/home.html');
});

app.get('/addshoe.html', isAuthenticated, function (req, res) {
    res.sendFile(__dirname + '/addshoe.html');
});

app.get('/shop.html', function (req, res) {
    res.sendFile(__dirname + '/shop.html');
});

app.get('/login.html', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.get('/signup.html', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/css/navbar.css', function (req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/css/navbar.css');
});

app.get('/images/logo2-2.jpg', function (req, res) {
    res.sendFile(__dirname + '/images/logo2-2.jpg');
});

app.get('/addshoe.html', isAuthenticated, function (req, res) {
    res.sendFile(__dirname + '/addshoe.html');
});

app.post("/login", async function(req, res) {
    const { email, password } = req.body;

    try {
        const foundUser = await users.findOne({ email, password }).exec();

        if (foundUser) {
            req.session.authenticated = true;
            res.redirect("/home.html");
        } else {
            res.status(401).send("Invalid email or password. Please try again.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(5500, () => {
    console.log("Server started on port 5500");
});
