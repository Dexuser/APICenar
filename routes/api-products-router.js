import express from "express";
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProductById,
  updateProduct,
} from "../controllers/api/ProductApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import { uploadApiProductImage } from "../middlewares/apiUpload.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateCreateProduct,
  validateProductId,
  validateUpdateProduct,
} from "./validations/apiProductValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.COMMERCE));

router.get("/", getMyProducts);
router.get("/:id", validateProductId, handleApiValidation, getProductById);
router.post(
  "/",
  uploadApiProductImage,
  validateCreateProduct,
  handleApiValidation,
  createProduct
);
router.put(
  "/:id",
  uploadApiProductImage,
  validateUpdateProduct,
  handleApiValidation,
  updateProduct
);
router.delete("/:id", validateProductId, handleApiValidation, deleteProduct);

export default router;
