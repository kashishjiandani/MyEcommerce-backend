const express = require("express");
const cors = require('cors');
const app = express();
const errorMiddleware = require("./middleware/error");


app.use(express.json());

app.use(cors());

app.get("/",(req,res)=>{
    // console.log("Backend is running!");
    res.send({status:200,msg:"Backend is running!"});
});

// Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const cart = require("./routes/cartRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", cart);

// Middleware for errors
app.use(errorMiddleware);

module.exports = app;
