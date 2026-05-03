const express = require("express");
const { createOrder, getOrders, sendOtp, verifyOtp } = require("../controllers/orderController");
const router = express.Router();

router.route("/").get(getOrders).post(createOrder);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

module.exports = router;
