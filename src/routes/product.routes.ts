import { Router } from "express";
import {
  getProducts,
  getProductsById,
  postProduct,
  putProduct,
  deleteProducts,
} from "../controllers/product.controller.js";
import { validateProduct } from "../middleware/product.middleware.js";
const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductsById);
router.post("/", validateProduct, postProduct);
router.put("/:id", putProduct);
router.delete("/:id", deleteProducts);

export default router;
