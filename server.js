const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const cors = require('cors');

app.use(cors());

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }))
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

const upload = multer({ dest: 'uploads/' }); // Set the destination folder for uploaded images

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
  brand: String,
  name: String,
  size: Number,
  price: String,
  stock: Number,
  image: String, // Add a field to store the image file name
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  }
});

const shoes = mongoose.model("shoes", shoesSchema);

app.post('/addShoe', isAuthenticated, upload.single('shoeImage'), async function (req, res) {
  const shoeData = req.body;
  const stock = parseInt(shoeData.stock);

  // Check if the requested stock is greater than 0
  if (stock <= 0) {
    return res.status(400).send('Stock must be greater than 0.');
  }

  try {
    // Create a new shoe and save it to the database
    const newShoe = new shoes({
      brand: req.body.brand,
      name: req.body.name,
      size: req.body.size,
      price: req.body.price,
      image: req.file.filename, // Store the original image file name
      stock: stock,
      addedBy: req.session.user._id,
    });

    const savedShoe = await newShoe.save();

    // Update the available stock for the requested shoe
    savedShoe.stock = stock;
    await savedShoe.save();

    // Add the item to the shopping cart
    let newCartItem = {
      brand: savedShoe.brand,
      name: savedShoe.name,
      size: savedShoe.size,
      price: savedShoe.price,
      image: savedShoe.image, // Use the original image file name
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
    res.status(500).send('Error adding the shoe to the database.');
  }
});

app.get('/check-authentication', (req, res) => {
  const isAuthenticated = req.session.authenticated === true;
  res.json({ isAuthenticated });
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

app.get('/user-info', isAuthenticated, async (req, res) => {
  try {
    // Fetch user information from the database based on the user's session or ID
    const user = await users.findOne({ _id: req.session.user._id });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine the 'firstName' and 'lastName' fields into a 'name' field
    const name = user.firstName + ' ' + user.lastName;

    // Send the user's information as JSON response with the 'name' field
    res.json({
      name: name, // Combine 'firstName' and 'lastName' into 'name'
      address: user.address,
      email: user.email,
      // Add other user fields as needed
    });
  } catch (err) {
    console.error('Error fetching user information:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/my-shoes', isAuthenticated, async (req, res) => {
  try {
    // Fetch shoes added by the currently logged-in user
    const userShoes = await shoes.find({ addedBy: req.session.user._id });

    res.json(userShoes);
  } catch (err) {
    console.error("Error fetching user's shoes:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/delete-shoe/:id', isAuthenticated, async (req, res) => {
  const shoeId = req.params.id;

  try {
      const deletedShoe = await shoes.findByIdAndDelete(shoeId);

      if (deletedShoe) {
          // Successfully deleted the shoe
          res.status(200).send('Shoe deleted.');
      } else {
          // Shoe not found or deletion failed
          res.status(404).send('Shoe not found.');
      }
  } catch (error) {
      console.error('Error deleting the shoe:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Define the simulatePaymentProcessing function at the top level of your code
function simulatePaymentProcessing(cardNumber, expDate) {
  // In a real application, you should implement your actual payment processing logic here.
  // For this example, we'll simulate a successful payment if the card number is valid.
  const validCardNumber = '1234567890123456';
  const validExpDate = '12/25';

  if (cardNumber === validCardNumber && expDate === validExpDate) {
    return true; // Payment is successful
  } else {
    return false; // Payment failed
  }
}

app.post('/process-payment', async (req, res) => {
  // Retrieve payment information from the request body
  const { cardNumber, expDate, cart } = req.body;

  // Simulate payment processing logic here (e.g., validate card number, expiration date, etc.)
  const isPaymentSuccessful = simulatePaymentProcessing(cardNumber, expDate);

  if (isPaymentSuccessful) {
    // Payment is successful, so delete purchased shoes from the database
    try {
      // Create an array of shoe IDs to delete
      const shoeIdsToDelete = cart.map(item => item.shoe._id);

      // Use Mongoose to delete the shoes with matching IDs
      await shoes.deleteMany({ _id: { $in: shoeIdsToDelete } });

      res.sendStatus(200); // Send a success response
    } catch (error) {
      console.error('Failed to delete purchased shoes:', error);
      res.status(500).json({ error: 'Failed to delete purchased shoes' });
    }
  } else {
    // Payment failed, respond with an error status
    res.status(400).json({ error: 'Payment failed' });
  }
});app.post('/process-payment', async (req, res) => {
  // Retrieve payment information and user details from the request body
  const { cardNumber, expDate, cart, firstName, lastName, address } = req.body;

  // Here you can add logic to handle or store the user's information, like firstName, lastName, and address.
  // For example, save these details to the database, use them in the payment process, etc.

  // Simulate payment processing logic here (e.g., validate card number, expiration date, etc.)
  const isPaymentSuccessful = simulatePaymentProcessing(cardNumber, expDate);

  if (isPaymentSuccessful) {
    // Payment is successful, so delete purchased shoes from the database
    try {
      // Create an array of shoe IDs to delete
      const shoeIdsToDelete = cart.map(item => item.shoe._id);

      // Use Mongoose to delete the shoes with matching IDs
      await shoes.deleteMany({ _id: { $in: shoeIdsToDelete } });

      res.sendStatus(200); // Send a success response
    } catch (error) {
      console.error('Failed to delete purchased shoes:', error);
      res.status(500).json({ error: 'Failed to delete purchased shoes' });
    }
  } else {
    // Payment failed, respond with an error status
    res.status(400).json({ error: 'Payment failed' });
  }
});

function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

app.get('/addshoe.html', function (req, res) {
  if (req.session.authenticated) {
      res.sendFile(__dirname + '/addshoe.html');
  } else {
      res.redirect('/login.html');
  }
});

app.use(express.static('uploads')); // Serve uploaded images

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

app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const foundUser = await users.findOne({ email, password }).exec();

    if (foundUser) {
      req.session.user = foundUser;
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

app.get('/logout', (req, res) => {
  // Clear the user's session or perform necessary logout actions
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500); // Handle the error as needed
    } else {
      res.redirect('/home.html'); // Redirect to the home page or a login page
    }
  });
});

app.listen(5500, () => {
  console.log("Server started on port 5500");
});
