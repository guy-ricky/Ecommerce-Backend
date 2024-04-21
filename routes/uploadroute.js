const express = require("express");
const { uploadImages, deleteImages } = require("../controllers/uploadCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authmiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

module.exports = router;