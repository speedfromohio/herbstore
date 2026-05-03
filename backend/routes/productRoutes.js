const express = require("express");
const { addProduct, getProducts, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(protect, addProduct);

router.route("/:id")
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
