const mongoose = require('mongoose');
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const Cart = require("../models/Cart.model")
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/products.models');
const { exist } = require('joi');



const getCartDetail = asyncHandler(async (req, res) => {
    try {
        const { userId, cartId } = req.query

        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).json(new ApiResponse(404, null, "Hair test not found"));
        }


        return res.status(200).json(new ApiResponse(200, cart, "Cart details retrieved successfully"));

    } catch (error) {
        throw new ApiError(400, "Something went wrong", error.message);
    }
});

const updateCart = asyncHandler(async (req, res) => {

    try {
        const userId = req.query.userId

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        // console.log("useriddddddddd", userId)


       let cart
        cart = await Cart.findOne({ userId });
        
        if(cart){
            cart.items=req.body
        }
        else{
            cart = new Cart({
                userId: userId,
                items: req.body
            });
        }
        await cart.save()

        return res.status(201).json({
            success: true,
            message: "Successfully updated"
        });
    } catch (error) {

        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update cart" });
    }
});


const addToCart = asyncHandler(async (req, res) => {

    try {
        const userId = req.query.userId

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        // console.log("useriddddddddd", userId)


       let cart
        cart = await Cart.findOne({ userId });
        
        if(cart){
            let p = cart.items;
            let exist = cart.items?.findIndex((e) => e?.item?._id == req.body?.item?._id)
            if(exist != -1){
              p[exist].quantity = p[exist].quantity + (req.body?.quantity || 0)
            }
            else p.push(req.body);
            cart.items=p;
        }
        else{
            cart = new Cart({
                userId: userId,
                items: [req.body]
            });
        }
        await cart.save()

        return res.status(201).json({
            success: true,
            message: "Successfully updated"
        });
    } catch (error) {

        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update cart" });
    }
});


const deleteCartItems = asyncHandler(async (req, res) => {
    try {
        const { userId,id } = req.query;
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).send('Cart not found for this user');
        }

        let products = cart?.items?.filter((e) => e?.item._id != id)
        if(products){
            cart.items = products;
            await cart.save()
        }
        return res.status(200).json(new ApiResponse(200, cart, "Cart detail deleted successfully"));
    } catch (error) {
        return res.status(400).json(new ApiError(400, "Something went wrong while getting cart details"));
    }
})


module.exports = {
    getCartDetail,
    deleteCartItems,
    updateCart,
    addToCart
};

