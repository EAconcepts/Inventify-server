require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");
// Initialize express
const app = express();
// Connect to mongodb database
connectDB();

// Port and middlewares
app.use(cors());
const port = process.env.PORT || 7000;
app.use(express.json());
app.use(errorHandler);
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/user.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/products", require("./routes/product.route"));
app.use("/api/file", require("./routes/file.route"))

app.listen(port, () => console.log(`Server started on port ${port}`));
