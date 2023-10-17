const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
mongoose.connect("mongodb+srv://rolicus:CodeKicks4550@cluster0.oqn2t2i.mongodb.net/CodeKicks", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


/***************************************************/
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

app.post("/signup", function(req, res) { // Change the form action to "/signup"
    let newUsers = new users({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        email: req.body.email,
        password: req.body.password,
    });
    newUsers.save()
        .then(() => {
            res.redirect('/login.html'); // Redirect to login after signup
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error during signup");
        });
});

/***********************************************************************/
const shoesSchema = new mongoose.Schema({
    name: String,
    price: String,
    description: String,
});

const shoes = mongoose.model("shoes", shoesSchema);
// Route to handle adding a shoe
app.post("/addShoe", function(req, res) {
    let newShoe = new shoes({
        name: req.body.name, // Replace with the appropriate form field names
        price: req.body.price,
        description: req.body.description,
        // Add other shoe properties as needed
    });

    newShoe.save()
        .then(() => {
            res.redirect('/shop.html'); // Redirect to the shop page after adding a shoe
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error adding the shoe");
        });
});



app.use(express.static('images')); // Serve static files from the 'public' directory
app.use('images', express.static(__dirname + 'CodeKicks'));
/***********************************************************************/
// all these below rout links to server
app.get('/home.html', function (req, res) {
    res.sendFile(__dirname + '/home.html');
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

/*************************************************************/



app.post("/login", async function(req, res) {
    const { email, password } = req.body;

    try {
        const foundUser = await users.findOne({ email, password }).exec();

        if (foundUser) {
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
/*
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

//connects to database
mongoose.connect("mongodb+srv://rolicus:CodeKicks4550@cluster0.oqn2t2i.mongodb.net/CodeKicks" , {useNewUrlParser: true}, {useUnifiedTopology: true},)

//creates schema to send to database
const usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    address: String,
    email: String,
    password: String,
});

const users = mongoose.model("users", usersSchema);
//this was oringally singup.html
// Route to fetch all products
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/home.html');
})

app.post("/", function(req,res){
    let newUsers = new users({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        email: req.body.email,
        password: req.body.password
    });
    newUsers.save();
    res.redirect('/login.html');
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
})

app.use(express.static('CodeKicks'));

app.get('/home.html', function (req, res) {
    res.sendFile(__dirname + '/home.html');
}); 

app.get('/login.html', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.listen(5500, () => {
    console.log("Server started on port 5500");
});



// Route to handle the login form
app.post("/login", async function(req, res) {
    const { email, password } = req.body;

    try {
        // Check the database for the user with the provided email and password
        const foundUser = await users.findOne({ email, password }).exec();

        if (foundUser) {
            // User found, you can set up a session or send a success message
            // Redirect to the home page after a successful login
            res.redirect("/home.html");
        } else {
            // User not found or credentials do not match, you can send an error message
            res.status(401).send("Invalid email or password. Please try again.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
*/