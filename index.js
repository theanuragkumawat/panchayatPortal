const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
