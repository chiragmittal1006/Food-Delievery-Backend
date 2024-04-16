import { Router } from "express";

import { verifyJwt } from "../middleware/verifyJwt.middelware.js";
import { addCustomer, getAllCustomer, removeCustomer } from "../controller/customer.controller.js";
import {isAdmin} from "../middleware/isAdmin.middleware.js";

const router = Router();

router.use(verifyJwt)

router.route("/add-customer").post( addCustomer)
router.route("/remove-customer").delete(isAdmin , removeCustomer)
router.route("/get-all-customer").get( isAdmin , getAllCustomer)

export default router