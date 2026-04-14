import express from "express";
import {
  confirmEmail,
  forgotPassword,
  login,
  registerClient,
  registerCommerce,
  registerDelivery,
  resetPassword,
} from "../controllers/api/AuthApiController.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import {
  uploadApiCommerceLogo,
  uploadApiProfileImage,
} from "../middlewares/apiUpload.js";
import {
  validateApiConfirmEmail,
  validateApiForgotPassword,
  validateApiLogin,
  validateApiRegisterClient,
  validateApiRegisterCommerce,
  validateApiRegisterDelivery,
  validateApiResetPassword,
} from "./validations/apiAuthValidation.js";

const router = express.Router();

router.post("/login", validateApiLogin, handleApiValidation, login);
router.post(
  "/register-client",
  uploadApiProfileImage,
  validateApiRegisterClient,
  handleApiValidation,
  registerClient
);
router.post(
  "/register-delivery",
  uploadApiProfileImage,
  validateApiRegisterDelivery,
  handleApiValidation,
  registerDelivery
);
router.post(
  "/register-commerce",
  uploadApiCommerceLogo,
  validateApiRegisterCommerce,
  handleApiValidation,
  registerCommerce
);
router.post(
  "/confirm-email",
  validateApiConfirmEmail,
  handleApiValidation,
  confirmEmail
);
router.post(
  "/forgot-password",
  validateApiForgotPassword,
  handleApiValidation,
  forgotPassword
);
router.post(
  "/reset-password",
  validateApiResetPassword,
  handleApiValidation,
  resetPassword
);

export default router;
