const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/user'); // Assuming a User model exists
const { mongoConnect } = require('./connection');
const problemSchema = require('./models/problem'); // Assuming a Problem model exists

const app = express();
const JWT_SECRET = "your_jwt_secret_key"; // Replace with a secure key

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));

mongoConnect("mongodb+srv://rajeevprajapat06:Rajeev%4063789@fashion-view.jr5jy.mongodb.net/PunchayatAI?retryWrites=true&w=majority&appName=Fashion-View"
).then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Async/Await Example" });
});

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    console.log("User registered:", newUser);

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect("/");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error registering user");
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    console.log("User logged in:", user);
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error logging in");
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).send("Invalid Token");
  }
}

// Protected route example
app.get("/dashboard", authenticateToken, (req, res) => {
  res.send(`Welcome to your dashboard, user ID: ${req.user.id}`);
});

// Route to submit a problem
app.post("/submit-problem", authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const newProblem = new Problem({
      title,
      description,
      userId: req.user.id, // Associate the problem with the logged-in user
    });
    await newProblem.save();
    console.log("Problem submitted:", newProblem);
    res.status(201).send("Problem submitted successfully");
  } catch (err) {
    console.error("Error submitting problem:", err);
    res.status(500).send("Error submitting problem");
  }
});
const api = "https://api.postalpincode.in/pincode/303702";

async function fetchPincodeData(api) {
  try {
    const response = await fetch(api);
    const data = await response.json();
    
    // Data is an array, first element contains the PostOffice array
    const postOffices = data[0].PostOffice;

    // Now loop through and print each post office properly
    postOffices.forEach((office, index) => {
      console.log(`${index + 1}. ${office.Name} - ${office.District}, ${office.State}`);
    });

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchPincodeData(api);
// const pinCode = async (api) => {
//   const address = await fetch(api);
//   const data = address.json();
//   console.log(data);

// }

// pinCode(api);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});