const express = require("express");
const Product = require("../models/productModel");
const User = require('../models/userModel')
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoId = require('../utils/validateMongo')

const createProduct = asyncHandler(async (req, res) => {
  try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title)
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct)
  } catch (error) {
    throw new Error(error)
  }

})

  const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoId(id);
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateProduct);
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoId(id);
    try {
      const deleteProduct = await Product.findByIdAndDelete(id);
      res.json(deleteProduct);
    } catch (error) {
      throw new Error(error);
    }
  });

  const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id)
    try {
      const findProduct = await Product.findById(id);
      res.json(findProduct);
    } catch (error) {
      throw new Error(error);
    }
  });

  const getallproducts = asyncHandler(async(req,res) => {
    
    try {
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
        let query = Product.find(JSON.parse(queryStr));

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
          } else {
            query = query.sort("-createdAt");
          }

          if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
          } else {
            query = query.select("-__v");
          }

          const page = req.query.page;
          const limit = req.query.limit;
          const skip = (page - 1) * limit;
          query = query.skip(skip).limit(limit);
          if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This Page does not exist");
          } 

        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error)
    }
  })

  const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
      const user = await User.findById(_id);
      const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
      if (alreadyadded) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        res.json(user);
      } else {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        res.json(user);
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  const rating = asyncHandler(async (req, res) => {
    try {
      const { _id } = req.user;
      const { star, prodId, comment } = req.body;
  
      const product = await Product.findById(prodId);
      const alreadyRated = product.ratings.find(
        (userId) => userId.postedby.toString() === _id.toString()
      );
  
      if (alreadyRated) {
        // Update existing rating
        const updatedProduct = await Product.updateOne(
          {
            ratings: { $elemMatch: alreadyRated },
          },
          {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment },
          },
          { new: true }
        );
  
        // Calculate and update total rating
        const getallratings = await Product.findById(prodId);
        const totalRating = getallratings.ratings.length;
        const ratingsum = getallratings.ratings
          .map((item) => item.star)
          .reduce((prev, curr) => prev + curr, 0);
        const actualRating = Math.round(ratingsum / totalRating);
        await Product.findByIdAndUpdate(prodId, { totalrating: actualRating });
  
        res.json(updatedProduct);
      } else {
        // Create new rating
        const updatedProduct = await Product.findByIdAndUpdate(
          prodId,
          {
            $push: {
              ratings: {
                star: star,
                comment: comment,
                postedby: _id,
              },
            },
          },
          { new: true }
        );
  
        // Calculate and update total rating
        const getallratings = await Product.findById(prodId);
        const totalRating = getallratings.ratings.length;
        const ratingsum = getallratings.ratings
          .map((item) => item.star)
          .reduce((prev, curr) => prev + curr, 0);
        const actualRating = Math.round(ratingsum / totalRating);
        await Product.findByIdAndUpdate(prodId, { totalrating: actualRating });
  
        res.json(updatedProduct);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating rating" });
    }
  });
  
  module.exports = {  createProduct, updateProduct,getaProduct, getallproducts, deleteProduct, addToWishlist, rating};