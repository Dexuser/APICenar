import express from "express";
import {
  getAuthenticatedProfile,
  updateAuthenticatedProfile,
} from "../controllers/api/AccountApiController.js";
import { requireApiAuth } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import {
  uploadApiCommerceLogo,
  uploadApiProfileImage,
} from "../middlewares/apiUpload.js";
import { validateUpdateOwnProfile } from "./validations/apiAccountValidation.js";

const router = express.Router();

router.get("/me", requireApiAuth, getAuthenticatedProfile);

router.patch(
  "/me",
  requireApiAuth,
  (req, res, next) => {
    const upload = req.user.role === "commerce"
      ? uploadApiCommerceLogo
      : uploadApiProfileImage;

    return upload(req, res, next);
  },
  validateUpdateOwnProfile,
  handleApiValidation,
  updateAuthenticatedProfile
);

export default router;
