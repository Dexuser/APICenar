import express from "express";
import {
  createAdministrator,
  getAdministrators,
  getClients,
  getCommerces,
  getDeliveries,
  updateAdministrator,
  updateUserStatus,
} from "../controllers/api/AdminUserApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateAdminUserId,
  validateCreateAdmin,
  validateUpdateAdmin,
  validateUpdateUserStatus,
} from "./validations/apiAdminUserValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.ADMIN));

router.get("/clients", getClients);
router.get("/deliveries", getDeliveries);
router.get("/commerces", getCommerces);
router.get("/admins", getAdministrators);
router.post("/admins", validateCreateAdmin, handleApiValidation, createAdministrator);
router.put(
  "/admins/:id",
  validateUpdateAdmin,
  handleApiValidation,
  updateAdministrator
);
router.patch(
  "/:id/status",
  validateUpdateUserStatus,
  handleApiValidation,
  updateUserStatus
);

export default router;
