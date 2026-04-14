import { body, param } from "express-validator";

export const validateAdminUserId = [
  param("id").trim().isMongoId().withMessage("id must be a valid MongoDB id."),
];

export const validateCreateAdmin = [
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

export const validateUpdateAdmin = [
  ...validateAdminUserId,
  body("firstName").trim().notEmpty().withMessage("firstName is required."),
  body("lastName").trim().notEmpty().withMessage("lastName is required."),
  body("userName").trim().notEmpty().withMessage("userName is required."),
  body("email").trim().isEmail().withMessage("email must be valid."),
  body("phone").trim().notEmpty().withMessage("phone is required."),
  body("password")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long."),
  body("confirmPassword")
    .optional({ values: "falsy" })
    .trim()
    .custom((value, { req }) => {
      if (req.body.password && value !== req.body.password) {
        throw new Error("password and confirmPassword must match.");
      }

      return true;
    }),
];

export const validateUpdateUserStatus = [
  ...validateAdminUserId,
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be a boolean."),
];
