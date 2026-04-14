import { body, param } from "express-validator";

const addressBodyValidation = [
  body("label").trim().notEmpty().withMessage("label is required."),
  body("street").trim().notEmpty().withMessage("street is required."),
  body("sector").trim().notEmpty().withMessage("sector is required."),
  body("city").trim().notEmpty().withMessage("city is required."),
  body("reference").trim().notEmpty().withMessage("reference is required."),
];

export const validateAddressId = [
  param("id").trim().isMongoId().withMessage("id must be a valid MongoDB id."),
];

export const validateCreateAddress = [...addressBodyValidation];

export const validateUpdateAddress = [
  ...validateAddressId,
  ...addressBodyValidation,
];
