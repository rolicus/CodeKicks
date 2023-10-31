const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

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
});

const shoes = mongoose.model("shoes", shoesSchema);

app.post("/addShoe", isAuthenticated, function(req, res) {
    let newShoe = new shoes({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
    });

    newShoe.save()
        .then(() => {
            res.redirect('/shop.html');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error adding the shoe");
        });
});

app.get("/shoes", function (req, res) {
    // Fetch shoe data from your database
    shoes.find({}, (err, shoes) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Error fetching shoe data" });
        } else {
            // Send the shoe data as JSON
            res.json(shoes);
        }
    });
});


app.delete("/deleteShoe/:id", (req, res) => {
    const shoeId = req.params.id; // Extract the shoe ID from the URL
    
    // Use Mongoose to delete the shoe from the database
    shoes.findByIdAndRemove(shoeId, (err) => {
        if (err) {
            console.error("Failed to delete the shoe:", err);
            res.status(500).send("Failed to delete the shoe.");
        } else {
            // Send a success response
            res.sendStatus(200);
        }
    });
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
