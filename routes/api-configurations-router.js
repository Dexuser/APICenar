import express from "express";
import {
  getConfigurationByKey,
  getConfigurations,
  updateConfiguration,
} from "../controllers/api/ConfigurationApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateConfigurationKeyParam,
  validateUpdateConfiguration,
} from "./validations/apiConfigurationValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.ADMIN));

router.get("/", getConfigurations);
router.get("/:key", validateConfigurationKeyParam, handleApiValidation, getConfigurationByKey);
router.put("/:key", validateUpdateConfiguration, handleApiValidation, updateConfiguration);

export default router;
