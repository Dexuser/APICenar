import UserRoles from "../models/enums/userRoles.js";
import express from "express";
import {
  Login,
  ActivateUser,
  ForgotPassword,
  Register,
  RegisterCommerce,
  ResetPassword
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
import { validate } from "uuid";

const router = express.Router();

// User route

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Authentication]
 *     description: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - emailOrUsername
 *               - password
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid Request
 */
router.post("/auth/login", validatePostLogin, Login);

/**
 * @swagger
 * /api/auth/register-client:
 *   post:
 *     summary: Register a Client
 *     tags: [Authentication]
 *     description: Register a new client user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - username
 *                 - phone
 *                 - profilePicture
 *                 - email
 *                 - password
 *                 - confirmPassword
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid Request
 *       409:
 *         description: User already exists
 */

router.post(
  "/auth/register-client",
  uploadProfilePicture,
  validatePostClientOrDeliveryRegister,
  handleValidationErrors(),
  Register(UserRoles.CLIENT)
);


/**
 * @swagger
 * /api/auth/register-delivery:
 *   post:
 *     summary: Register a Delivery
 *     tags: [Authentication]
 *     description: Register a new delivery user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *              required:
 *                - firstName
 *                - lastName
 *                - username
 *                - phone
 *                - profilePicture
 *                - email
 *                - password
 *                - confirmPassword
 * 
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid Request
 *       409:
 *         description: User already exists
 */

router.post(
  "/auth/register-delivery",
  uploadProfilePicture,
  validatePostClientOrDeliveryRegister,
  handleValidationErrors(),
  Register(UserRoles.DELIVERY)
);


/**
 * @swagger
 * /api/auth/register-commerce:
 *   post:
 *     summary: Register a Commerce
 *     tags: [Authentication]
 *     description: Register a new commerce user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               commerceName:
 *                 type: string
 *               description:
 *                 type: string
 *               openTime:
 *                 type: string
 *                 example: "08:00"
 *               closeTime:
 *                 type: string
 *                 example: "18:30"
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *               commerceTypeId:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             required:
 *               - commerceName
 *               - description
 *               - openTime
 *               - closeTime
 *               - username
 *               - phone
 *               - logo
 *               - commerceTypeId
 *               - email
 *               - password
 *               - confirmPassword
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid Request
 *       409:
 *         description: User already exists
 */
router.post(
  "/auth/register-commerce",
  uploadLogo,
  validatePostCommerceRegister,
  handleValidationErrors(),
  RegisterCommerce
);


/**
 * @swagger
 * /api/auth/confirm-email:
 *   post:
 *     summary: Confirm Email
 *     tags: [Authentication]
 *     description: Confirm the user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *           required:
 *             - token
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *       400:
 *         description: Invalid Request
 *       404:
 *         description: token not found
 */

router.post(
  "/auth/confirm-email",
  validateGetActivate,
  handleValidationErrors(),
  ActivateUser
);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [Authentication]
 *     description: Request a password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid Request
 *       404:
 *         description: User not found
 */

router.post(
  "/auth/forgot-password",
  validatePostForgot,
  handleValidationErrors(),
  ForgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentication]
 *     description: Reset the user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid Request
 *       404:
 *         description: User not found
 */

router.post(
  "/auth/reset-password",
  validatePostReset,
  handleValidationErrors(),
  ResetPassword
);
export default router;
