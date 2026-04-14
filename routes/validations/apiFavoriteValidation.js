import { body, param } from "express-validator";

export const validateFavoriteBody = [
  body("commerceId")
    .trim()
    .isMongoId()
    .withMessage("commerceId must be a valid MongoDB id."),
];

export const validateFavoriteCommerceIdParam = [
  param("commerceId")
    .trim()
    .isMongoId()
    .withMessage("commerceId must be a valid MongoDB id."),
];
