import express from "express";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getMyAddresses,
  updateAddress,
} from "../controllers/api/AddressApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateAddressId,
  validateCreateAddress,
  validateUpdateAddress,
} from "./validations/apiAddressValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.CLIENT));

router.get("/", getMyAddresses);
router.get("/:id", validateAddressId, handleApiValidation, getAddressById);
router.post("/", validateCreateAddress, handleApiValidation, createAddress);
router.put("/:id", validateUpdateAddress, handleApiValidation, updateAddress);
router.delete("/:id", validateAddressId, handleApiValidation, deleteAddress);

export default router;
