import express from "express";
import isAuthForLogin from "../middlewares/isAuthForLogin.js";
import {
  GetLogin,
  GetRegisterSelectRole,
  GetRegisterForClientsAndDeliverys,
  GetRegisterForCommerces,
  PostRegisterClientOrDelivery,
  PostRegisterCommerce,
  PostLogin,
  Logout,
  GetForgot,
  PostForgot,
  GetReset,
  PostReset,
  GetActivate,
} from "../controllers/AuthController.js";
import {
  validatePostLogin,
  validatePostClientOrDeliveryRegister,
  validatePostCommerceRegister,
  validateGetActivate,
  validatePostForgot,
  validateGetReset,
  validatePostReset,
} from "./validations/authValidation.js";
import { handleValidationErrors } from "../middlewares/handleValidation.js";
import { uploadLogo, uploadProfilePicture } from "../middlewares/multer.js";

const router = express.Router();

// User route
router.get("/", isAuthForLogin, GetLogin);

router.post(
  "/",
  isAuthForLogin,
  validatePostLogin,
  handleValidationErrors("/"),
  PostLogin
);
router.get("/user/logout", Logout);


// register
router.get("/user/register-select", isAuthForLogin, GetRegisterSelectRole);
router.get("/user/register-user", isAuthForLogin, GetRegisterForClientsAndDeliverys);
router.get("/user/register-commerce", isAuthForLogin, GetRegisterForCommerces);

router.post(
  "/user/register-user",
  isAuthForLogin,
  uploadProfilePicture,
  validatePostClientOrDeliveryRegister,
  handleValidationErrors("/user/register-user"),
  PostRegisterClientOrDelivery
);

router.post(
  "/user/register-commerce",
  isAuthForLogin,
  uploadLogo,
  validatePostCommerceRegister,
  handleValidationErrors("/user/register-commerce"),
  PostRegisterCommerce
);

router.get("/user/forgot", isAuthForLogin, GetForgot);

router.post(
  "/user/forgot",
  isAuthForLogin,
  validatePostForgot,
  handleValidationErrors("/user/forgot"),
  PostForgot
);

router.get(
  "/user/reset/:token",
  isAuthForLogin,
  validateGetReset,
  handleValidationErrors("/"),
  GetReset
);

router.post(
  "/user/reset",
  isAuthForLogin,
  validatePostReset,
  handleValidationErrors((req) => `/user/reset/${req.body.PasswordToken}`),
  PostReset
);

router.get(
  "/user/activate/:token",
  isAuthForLogin,
  validateGetActivate,
  handleValidationErrors("/"),
  GetActivate
);

export default router;
