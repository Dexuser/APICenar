import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getMyCategories,
  updateCategory,
} from "../controllers/api/CategoryApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
} from "./validations/apiCategoryValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.COMMERCE));

router.get("/", getMyCategories);
router.get("/:id", validateCategoryId, handleApiValidation, getCategoryById);
router.post("/", validateCreateCategory, handleApiValidation, createCategory);
router.put("/:id", validateUpdateCategory, handleApiValidation, updateCategory);
router.delete("/:id", validateCategoryId, handleApiValidation, deleteCategory);

export default router;
