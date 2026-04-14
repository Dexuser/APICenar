import express from "express";
import {
  createCommerceType,
  deleteCommerceType,
  getAdminCommerceTypeById,
  getAdminCommerceTypes,
  updateCommerceType,
} from "../controllers/api/AdminCommerceTypeApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import {
  uploadApiCommerceTypeIcon,
} from "../middlewares/apiUpload.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateCommerceTypeId,
  validateCreateCommerceType,
  validateUpdateCommerceType,
} from "./validations/apiAdminCommerceTypeValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.ADMIN));

router.get("/", getAdminCommerceTypes);
router.get("/:id", validateCommerceTypeId, handleApiValidation, getAdminCommerceTypeById);
router.post(
  "/",
  uploadApiCommerceTypeIcon,
  validateCreateCommerceType,
  handleApiValidation,
  createCommerceType
);
router.put(
  "/:id",
  uploadApiCommerceTypeIcon,
  validateUpdateCommerceType,
  handleApiValidation,
  updateCommerceType
);
router.delete("/:id", validateCommerceTypeId, handleApiValidation, deleteCommerceType);

export default router;
