const express = require("express");

const { getCartDetail, updateCart, deleteCartItems,addToCart } = require("../controllers/cart.controller.js");





const router = express.Router();

router.get("/get-cart", getCartDetail)
router.post("/update-cart", updateCart)
router.post("/add-cart", addToCart)
router.post("/delete-cart", deleteCartItems)







module.exports = router