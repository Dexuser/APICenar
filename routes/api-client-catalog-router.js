import express from "express";
import {
  getCommerceCatalog,
  getCommerces,
  getCommerceTypes,
} from "../controllers/api/ClientCatalogApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateCommerceIdParam,
  validateCommerceListQuery,
} from "./validations/apiClientCatalogValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.CLIENT));

router.get("/commerce-types", getCommerceTypes);
router.get("/commerce", validateCommerceListQuery, handleApiValidation, getCommerces);
router.get(
  "/commerce/:commerceId/catalog",
  validateCommerceIdParam,
  handleApiValidation,
  getCommerceCatalog
);

export default router;
