import { body, param } from "express-validator";

const categoryBodyValidation = [
  body("name").trim().notEmpty().withMessage("name is required."),
  body("description").trim().notEmpty().withMessage("description is required."),
];

export const validateCategoryId = [
  param("id").trim().isMongoId().withMessage("id must be a valid MongoDB id."),
];

export const validateCreateCategory = [...categoryBodyValidation];

export const validateUpdateCategory = [
  ...validateCategoryId,
  ...categoryBodyValidation,
];
