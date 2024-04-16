import { verifyJwt } from "../middleware/verifyJwt.middelware.js";
import { Router } from "express";

import { addProduct, deleteProduct, getAllProducts, updateProduct } from "../controller/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { isAdmin } from "../middleware/isAdmin.middleware.js";

const router = Router();

router.route("/add-product").post(verifyJwt , isAdmin , upload.single('image') , addProduct)
router.route("/delete-product").delete(verifyJwt ,deleteProduct)
router.route("/update-product").patch(verifyJwt ,updateProduct)
router.route("/all-products").get(getAllProducts)

export default router;