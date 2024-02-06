const express = require('express');
const { createProduct, getaProduct, getallproducts, updateProduct, deleteProduct, addToWishlist, rating, uploadImages } = require('../controllers/productCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authmiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/upload', authMiddleware, isAdmin, uploadPhoto.array("images", 10), productImgResize, uploadImages)
router.get('/:id', getaProduct);
router.put('/wishlist', authMiddleware, addToWishlist)
router.put('/rating', authMiddleware, rating)
router.put('/:id', authMiddleware, isAdmin,  updateProduct);
router.delete('/:id', authMiddleware, isAdmin,  deleteProduct);
router.get('/', getallproducts);


module.exports = router;