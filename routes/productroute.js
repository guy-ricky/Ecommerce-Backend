const express = require('express');
const { createProduct, getaProduct, getallproducts, updateProduct, deleteProduct, addToWishlist, rating} = require('../controllers/productCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authmiddleware');
const router = express.Router();
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.array('images'), authMiddleware, isAdmin, createProduct);
router.get('/:id', getaProduct);
router.put('/wishlist', authMiddleware, addToWishlist)
router.put('/rating', authMiddleware, rating)
router.put('/:id', authMiddleware, isAdmin,  updateProduct);
router.delete('/:id', authMiddleware, isAdmin,  deleteProduct);
router.get('/', getallproducts);


module.exports = router;