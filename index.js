const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/user'); // Assuming a User model exists
const { mongoConnect } = require('./connection');
const problem = require('./models/problem.js'); // Assuming a Problem model exists
const mongoose = require('mongoose');
const multer = require('multer');

const Product_Image_Path = './public/ProblemImages';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, Product_Image_Path);
  },
  filename: function (req, file, cb) {
    return cb(null, file.originalname);
  }
});
const img = multer({ storage });

const app = express();
const JWT_SECRET = "your_jwt_secret_key"; // Replace with a secure key

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
app.get("/", authenticateToken, (req, res) => {
  res.render("index", { title: "Async/Await Example" });
});
app.get("/problems", (req, res) => {
  res.render("problems", { title: "Problems" });
})
app.get("/login", (req, res) => {
  res.render("sign", { title: "Login" });
})

app.get("/problemUpload", (req, res) => {
  res.render("form", { title: "Problem Upload" });
});

app.get("/status", authenticateToken, async (req, res) => {
  try {
    // Fetch problems associated with the logged-in user
    const userProblems = await problem.find({ userId: req.user.id });

    console.log("User problems:", userProblems);

    // Render the problems in the "status" view
    res.render("problems", { title: "Your Problems", problems: userProblems });
  } catch (err) {
    console.error("Error fetching problems:", err);
    res.status(500).send("Error fetching problems");
  }
});

// Signup route
app.post("/signup", async (req, res) => {
  const { fname, email, password } = req.body;
  console.log("hello")
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fname,
      email,
      password: hashedPassword,
    });
    // await newUser.save();
    console.log("User registered:", newUser);
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true });
    return res.redirect("/"); // Redirect to login after signup
  } catch (err) {
    console.error("Signup error:", err);
    return res.redirect("/login"); // Redirect to login on error
  }
});


// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found");
      return res.status(400).send("Invalid email or password"); // Send an error response
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Invalid password");
      return res.status(400).send("Invalid email or password"); // Send an error response
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true });
    console.log("User logged in:", user);
    return res.redirect("/"); // Redirect to home after login
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send("Error logging in"); // Send a generic error response
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login"); // Redirect to login if no token is found
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.redirect("/login"); // Redirect to login if token is invalid
  }
}

// Protected route example
app.get("/dashboard", authenticateToken, (req, res) => {
  res.send(`Welcome to your dashboard, user ID: ${req.user.id}`);
});

const api = "https://api.postalpincode.in/pincode/303702";

// fetchPincodeData(api);
app.post("/submit-problem", authenticateToken, img.array('imgPath', 4), async (req, res) => {
  try {
    // Extract file paths
    let paths = [];

    req.files.forEach(file => {
      paths.push(`${file.destination.split("/").pop()}/${file.originalname}`);
    });

    console.log(req.body);

    // Extract form data
    const {
      title,
      description,
      urgency,
      pincode,
      state,
      district,
      city,
      area,
    } = req.body;

    console.log("Form data:", req.body);
    // console.log("Uploaded files:", paths);

    // Validate input
    if (!title || !description) {
      return res.status(400).send("Title and description are required");
    }

    // Create a new problem document
    const newProblem = await problem.create({
      userId: req.user.id, // Add the user's ObjectId from the JWT
      title,
      description,
      urgency,
      pincode,
      state,
      district,
      city,
      area,
      ProblemImages: paths, // Store the image paths in the database
    });

    console.log("Problem uploaded:", newProblem);

    // Respond with success
    return res.redirect("/"); // Redirect to home page after successful upload
  } catch (err) {
    console.error("Error uploading problem:", err);
    res.status(500).send("Error uploading problem");
  }
});
// app.post("/submit-problem", authenticateToken, img.array('imgPath', 4), async (req, res) => {

//   let paths = [];
//   req.files.forEach(file => {
//     paths.push(`${file.destination.split("/").pop()}/${file.originalname}`);
//   })

//   const { title,
//     description,
//     urgency,
//     pincode,
//     state,
//     district,
//     city,
//     area,
//   } = req.body;
//   console.log("Form data:", req.body);

//   // Validate input
//   if (!title || !description) {
//     return res.status(400).send("Title and description are required");
//   }

//   try {
//     // Create a new problem document
//     const newProblem = await problem.create({
//       userId: req.user.id, // Add the user's ObjectId from the JWT
//       title,
//       description,
//       urgency,
//       pincode,
//       state,
//       district,
//       city,
//       area,
//       ProblemImages: paths, // Store the image paths in the database
//        // Associate the problem with the logged-in user
//     });

//     // Save the problem to the database
//     await newProblem.save();
//     console.log("Problem uploaded:", newProblem);

//     // Respond with success
//     return res.redirect("/"); // Redirect to problems page after successful upload
//   } catch (err) {
//     console.error("Error uploading problem:", err);
//     res.status(500).send("Error uploading problem");
//   }
// });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});