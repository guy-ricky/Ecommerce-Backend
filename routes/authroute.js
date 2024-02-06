const express = require('express');
const {createUser, loginUser, getallUsers, getaUser, delaUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, adminlogin, getWishList, saveAddress, userCart, getUserCart, emptyCart, createOrder, getOrders, updateOrderStatus, getAllOrders, getOrderByUserId} = require('../controllers/userCtrl')
const {authMiddleware, isAdmin} = require('../middlewares/authmiddleware')
const router = express.Router();


router.post('/register', createUser);
router.post('/forgot-password', forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.put('/password', authMiddleware, updatePassword)
router.post('/login', loginUser);
router.post('/admin-login', adminlogin);
router.post('/cart', authMiddleware, userCart)
router.post('/cart/create-order', authMiddleware, createOrder)
router.get('/all-users', getallUsers);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout)
router.get('/wishlist', authMiddleware, getWishList);
router.put('/save-address', authMiddleware, saveAddress)
router.get('/cart', authMiddleware, getUserCart)
router.get('/get-orders', authMiddleware, getOrders)
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.get("/getorderbyuser/:id", authMiddleware, isAdmin, getOrderByUserId);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete('/empty-cart', authMiddleware, emptyCart)
router.delete('/:id', delaUser);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);



module.exports = router;