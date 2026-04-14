import express from "express";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../controllers/api/FavoriteApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateFavoriteBody,
  validateFavoriteCommerceIdParam,
} from "./validations/apiFavoriteValidation.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.CLIENT));

router.get("/", getMyFavorites);
router.post("/", validateFavoriteBody, handleApiValidation, addFavorite);
router.delete(
  "/:commerceId",
  validateFavoriteCommerceIdParam,
  handleApiValidation,
  removeFavorite
);

export default router;
