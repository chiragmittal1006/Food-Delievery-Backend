import { Router } from "express";

import { addToCart, loginUser, logoutUser, registerUser } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middelware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJwt ,logoutUser)
router.route("/add-to-cart").patch(verifyJwt ,addToCart)

export default router;