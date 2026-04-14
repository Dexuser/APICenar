import { body, param } from "express-validator";

export const validateCommerceTypeId = [
  param("id").trim().isMongoId().withMessage("id must be a valid MongoDB id."),
];

export const validateCreateCommerceType = [
  body("name").trim().notEmpty().withMessage("name is required."),
];

export const validateUpdateCommerceType = [
  ...validateCommerceTypeId,
  body("name").trim().notEmpty().withMessage("name is required."),
];
