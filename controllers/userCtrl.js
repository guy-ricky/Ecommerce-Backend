const User = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const {generateToken} = require('../config/jwtToken');
const validateMongoId = require('../utils/validateMongo');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const uniqid = require('uniqid')
const sendEmail = require('./emailCtrl');
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')


const createUser = asyncHandler (
    async (req, res) => {
        const email = req.body.email;
        const findUser = await User.findOne({email: email});
        if (!findUser) {
                const newUser = await User.create(req.body);
                res.json(newUser)
        }
        else {
            throw new Error('User Already Exists')
        }
    });

    const loginUser = asyncHandler(async(req,res) => {
        const {email, password} = req.body;
       
        const findUser = await User.findOne({email});
        if(findUser && await findUser.isPasswordMatched(password)) {
            const refreshToken = await generateRefreshToken(findUser?._id)
            const updateuser = await User.findByIdAndUpdate(findUser.id, 
                {
                refreshToken: refreshToken,
            },
                {
                    new: true,
                }
            );
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72*60*60*1000,
                secure: true
            });
            
            res.json({
                _id: findUser?._id,
                username: findUser?.username,
                email: findUser?.email,
                token: generateToken(findUser?._id),
            })
        } else {
            throw new Error("Invalid Credentials")
        }
    });

    const adminlogin = asyncHandler(async(req,res) => {
        const {email, password} = req.body;
       
        const findAdmin = await User.findOne({email});
        if (findAdmin.role !== 'admin') throw new Error('Not Authorized');
        if(findAdmin && await findAdmin.isPasswordMatched(password)) {
            const refreshToken = await generateRefreshToken(findAdmin?._id)
            const updateuser = await User.findByIdAndUpdate(findAdmin.id, 
                {
                refreshToken: refreshToken,
            },
                {
                    new: true,
                }
            );
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72*60*60*1000,
                secure: true
            });
            
            res.json({
                _id: findAdmin?._id,
                username: findAdmin?.username,
                email: findAdmin?.email,
                token: generateToken(findAdmin?._id),
            })
        } else {
            throw new Error("Invalid Credentials")
        }
    });

    const handleRefreshToken = asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });
        if (!user) throw new Error(" No Refresh token present in db or not matched");
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
          if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
          }
          const accessToken = generateToken(user?._id);
          res.json({ accessToken });
        });
      });


      const logout = asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });
        if (!user) {
          res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
          });
          return res.sendStatus(204); // forbidden
        }
        await User.findOneAndUpdate({refreshToken}, {
          refreshToken: "",
        });
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
        });
        res.sendStatus(204); // forbidden
      });

    const updateUser = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        validateMongoId( _id);
        try {
            const updatedUser = await User.findByIdAndUpdate(
                _id,
             {
                username: req?.body?.username,
                email: req?.body?.email,
                password: req?.body?.password,
            },
            {
                new: true,
            });
            res.json(updatedUser)
        } catch (error) {
            throw new Error(error)
        }
    })

    const saveAddress = asyncHandler(async (req, res, next) => {
        const { _id } = req.user;
        validateMongoId(_id);
      
        try {
          const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
              address: req?.body?.address,
            },
            {
              new: true,
            }
          );
          res.json(updatedUser);
        } catch (error) {
          throw new Error(error);
        }
      });
      

    const getallUsers = asyncHandler(async (req,res) => {
        try {
            const getUsers = await User.find();
            res.json(getUsers);
        }catch (error) {
            throw new Error(error);
        }
    })

    const getaUser = asyncHandler(async (req, res) => {
        const {id} = req.params;
        validateMongoId(id);
        try {
            const getaUser = await User.findById(id);
            res.json ({
                getaUser
            })
        } catch (error) {
            throw new Error(error);
        }
    });

  const delaUser = asyncHandler(async (req, res) => {
        const {id} = req.params;
        validateMongoId(id);
        try {
            const delaUser = await User.findByIdAndDelete(id);
            res.json ({
                delaUser
            })
        } catch (error) {
            throw new Error(error);
        }
    });

    const blockUser = asyncHandler(async (req,res) => {
        const {id} = req.params;
        validateMongoId(id);
        try {
            const block = await User.findByIdAndUpdate(
                id,
                {
                    isBlocked: true,
                },
                {
                    new: true,
                },
            );
            res.json({
                message: "User Blocked",
            })
        } catch (error) {
            throw new Error(error);
        }
    })
    const unblockUser = asyncHandler(async (req,res) => {
        const {id} = req.params;
        validateMongoId(id);
        try {
            const unblock = await User.findByIdAndUpdate(
                id,
                {
                    isBlocked: false,
                },
                {
                    new: true,
                },
            );
            res.json({
                message: "User UnBlocked",
            })
        } catch (error) {
            throw new Error(error);
        }
    })

    const updatePassword = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { password } = req.body;
        validateMongoId(_id);
        const user = await User.findById(_id);
        if (password) {
          user.password = password;
          const updatedPassword = await user.save();
          res.json(updatedPassword);
        } else {
          res.json(user);
        }
      });

      const forgotPasswordToken = asyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found!");
        try {
          const token = await user.createPasswordResetToken();
          await user.save();
          const resetURL = `Please follow this link to reset Your Password. This link will expire after 10 minutes. <a href='http://localhost:8000/api/user/reset-password/${token}'>Click Here</>`;
          const data = {
            to: email,
            text: "Hi there",
            subject: "Forgot Password Link",
            htm: resetURL,
          };
          sendEmail(data);
          res.json(token);
        } catch (error) {
          throw new Error(error);
        }
      });

      const resetPassword = asyncHandler(async (req, res) => {
        const { password } = req.body;
        const { token } = req.params;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) throw new Error(" Token Expired, Please try again later");
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json(user);
      });

      const getWishList = asyncHandler(async (req, res) => {
        const {_id} = req.user;
        validateMongoId(_id)

        try{
            const findUser = await User.findById(_id).populate('wishlist');
            res.json(findUser)
        } catch (error) {
            throw new Error(error)
        }
      })

      const userCart = asyncHandler(async (req, res) => {
        const { cart } = req.body;
        const { _id } = req.user;
        validateMongoId(_id);
        try {
          let products = [];
          const user = await User.findById(_id);
          // check if user already have product in cart
          const alreadyExistCart = await Cart.findOne({ orderby: user._id });
          if (alreadyExistCart) {
            alreadyExistCart.remove();
          }
          for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
          }
          let cartTotal = 0;
          for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
          }
          let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
          }).save();
          res.json(newCart);
        } catch (error) {
          throw new Error(error);
        }
      });

      const getUserCart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        validateMongoId(_id);
        try {
          const cart = await Cart.findOne({ orderby: _id }).populate(
            "products.product"
          );
          res.json(cart);
        } catch (error) {
          throw new Error(error);
        }
      });

      const emptyCart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        validateMongoId(_id);
        try {
          const user = await User.findOne({ _id });
          const cart = await Cart.findOneAndDelete({ orderby: user._id });
          res.json(cart);
        } catch (error) {
          throw new Error(error);
        }
      });

      const createOrder = asyncHandler(async (req, res) => {
        const { COD } = req.body;
        const { _id } = req.user;
        validateMongoId(_id);
      
        try {
          if (!COD) {
            throw new Error("Create cash order failed");
          }
      
          const user = await User.findById(_id);
          let userCart = await Cart.findOne({ orderby: user._id });
          let finalAmount = userCart.cartTotal;
      
          let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
              id: uniqid(),
              method: "COD",
              amount: finalAmount,
              status: "Cash on Delivery",
              created: Date.now(),
              currency: "Ksh",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
          }).save();
      
          let update = userCart.products.map((item) => {
            return {
              updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
              },
            };
          });
      
          const updated = await Product.bulkWrite(update, {});
          res.json({ message: "success" });
        } catch (error) {
          throw new Error(error);
        }
      });

      const getOrders = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        validateMongoId(_id);
        try {
          const userorders = await Order.findOne({ orderby: _id })
            .populate("products.product")
            .populate("orderby")
            .exec();
          res.json(userorders);
        } catch (error) {
          throw new Error(error);
        }
      });
      
      const getAllOrders = asyncHandler(async (req, res) => {
        try {
          const alluserorders = await Order.find()
            .populate("products.product")
            .populate("orderby")
            .exec();
          res.json(alluserorders);
        } catch (error) {
          throw new Error(error);
        }
      });

      const getOrderByUserId = asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoId(id);
        try {
          const userorders = await Order.findOne({ orderby: id })
            .populate("products.product")
            .populate("orderby")
            .exec();
          res.json(userorders);
        } catch (error) {
          throw new Error(error);
        }
      });

      const updateOrderStatus = asyncHandler(async (req, res) => {
        const { status } = req.body;
        const { id } = req.params;
        validateMongoId(id);
        try {
          const updateOrderStatus = await Order.findByIdAndUpdate(
            id,
            {
              orderStatus: status,
              paymentIntent: {
                status: status,
              },
            },
            { new: true }
          );
          res.json(updateOrderStatus);
        } catch (error) {
          throw new Error(error);
        }
      });
      
module.exports = {createUser, adminlogin,loginUser, getallUsers, getaUser, delaUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, getWishList, saveAddress, userCart, getUserCart,emptyCart, createOrder, getOrders, updateOrderStatus, getAllOrders, getOrderByUserId}