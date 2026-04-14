import { body } from "express-validator";

export const validateUpdateOwnProfile = [
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("email must be valid."),
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("firstName cannot be empty."),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("lastName cannot be empty."),
  body("phone").optional().trim().notEmpty().withMessage("phone cannot be empty."),
  body("openingTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("openingTime must use HH:mm format."),
  body("closingTime")
    .optional()
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("closingTime must use HH:mm format."),
];
