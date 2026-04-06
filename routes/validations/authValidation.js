import { body, param } from "express-validator";

export const validatePostLogin = [
  body("Email").trim().isEmail().withMessage("Invalid email format").escape(),
  body("Password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .escape(),
];

export const validatePostClientOrDeliveryRegister = [
  body("firstName").trim().notEmpty().withMessage("First Name is required").escape(),
  body("lastName").trim().notEmpty().withMessage("Last Name is required").escape(),
  body("phone").trim().notEmpty().withMessage("Phone is required").escape(),
  body("role").trim().notEmpty().withMessage("Role is required").escape(),
  body("username").trim().notEmpty().withMessage("Username is required").escape(),
  body("email").trim().isEmail().withMessage("Invalid email format").escape(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required"),
];

export const validatePostCommerceRegister = [
  body("commerceName")
    .trim()
    .notEmpty()
    .withMessage("Commerce Name is required")
    .escape(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .escape(),

  body("openTime")
    .trim()
    .notEmpty()
    .withMessage("openTime is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Opening Hour must be in HH:mm format")
    .escape(),

  body("closeTime")
    .trim()
    .notEmpty()
    .withMessage("closeTime is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Closing Hour must be in HH:mm format")
    .escape(),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .escape(),

  body("commerceTypeId")
    .trim()
    .notEmpty()
    .withMessage("Commerce Type is required")
    .escape(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required"),
];

export const validateGetActivate = [
  param("token").trim().notEmpty().withMessage("Token is required").escape(),
];

export const validatePostForgot = [
  body("Email").trim().isEmail().withMessage("Invalid email format").escape(),
];

export const validateGetReset = [
  param("token").trim().notEmpty().withMessage("Token is required").escape(),
];

export const validatePostReset = [
  body("Password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.ConfirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),

  body("ConfirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required"),

  body("UserId")
    .trim()
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID")
    .escape(),

  body("PasswordToken")
    .trim()
    .notEmpty()
    .withMessage("Password token is required")
    .escape(),
];
