import { body } from "express-validator";

export const validateApiLogin = [
  body("userNameOrEmail")
    .trim()
    .notEmpty()
    .withMessage("userNameOrEmail is required."),
  body("password").trim().notEmpty().withMessage("password is required."),
];

const baseRegisterValidation = [
  body("firstName").trim().notEmpty().withMessage("firstName is required."),
  body("lastName").trim().notEmpty().withMessage("lastName is required."),
  body("userName").trim().notEmpty().withMessage("userName is required."),
  body("email").trim().isEmail().withMessage("email must be valid."),
  body("phone").trim().notEmpty().withMessage("phone is required."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required.")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long."),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirmPassword is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password and confirmPassword must match.");
      }

      return true;
    }),
];

export const validateApiRegisterClient = [...baseRegisterValidation];

export const validateApiRegisterDelivery = [...baseRegisterValidation];

export const validateApiRegisterCommerce = [
  body("userName").trim().notEmpty().withMessage("userName is required."),
  body("email").trim().isEmail().withMessage("email must be valid."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required.")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long."),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirmPassword is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password and confirmPassword must match.");
      }

      return true;
    }),
  body("name").trim().notEmpty().withMessage("name is required."),
  body("phone").trim().notEmpty().withMessage("phone is required."),
  body("openingTime")
    .trim()
    .notEmpty()
    .withMessage("openingTime is required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("openingTime must use HH:mm format."),
  body("closingTime")
    .trim()
    .notEmpty()
    .withMessage("closingTime is required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("closingTime must use HH:mm format."),
  body("commerceTypeId")
    .trim()
    .notEmpty()
    .withMessage("commerceTypeId is required.")
    .isMongoId()
    .withMessage("commerceTypeId must be a valid MongoDB id."),
];

export const validateApiConfirmEmail = [
  body("token").trim().notEmpty().withMessage("token is required."),
];

export const validateApiForgotPassword = [
  body("userNameOrEmail")
    .trim()
    .notEmpty()
    .withMessage("userNameOrEmail is required."),
];

export const validateApiResetPassword = [
  body("token").trim().notEmpty().withMessage("token is required."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required.")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long."),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirmPassword is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password and confirmPassword must match.");
      }

      return true;
    }),
];
