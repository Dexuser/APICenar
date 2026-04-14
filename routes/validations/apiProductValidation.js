import { body, param } from "express-validator";

const productBodyValidation = [
  body("name").trim().notEmpty().withMessage("name is required."),
  body("description").trim().notEmpty().withMessage("description is required."),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("price is required.")
    .isFloat({ gt: 0 })
    .withMessage("price must be greater than 0."),
  body("categoryId")
    .trim()
    .isMongoId()
    .withMessage("categoryId must be a valid MongoDB id."),
];

export const validateProductId = [
  param("id").trim().isMongoId().withMessage("id must be a valid MongoDB id."),
];

export const validateCreateProduct = [...productBodyValidation];

export const validateUpdateProduct = [
  ...validateProductId,
  ...productBodyValidation,
];
