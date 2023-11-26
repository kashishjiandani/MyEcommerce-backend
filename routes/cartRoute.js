const express = require("express");
const { getCart,createCart, updateCart } = require("../controllers/cartController");
const { isAuthenticatedUser } = require("../middleware/auth");


const router = express.Router();

router.route("/cart/new").post(isAuthenticatedUser,createCart);

router.route("/cart/:id").get(isAuthenticatedUser,getCart);

router.route("/cart/:id").put(isAuthenticatedUser,updateCart)

module.exports = router;