import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as guidV4 } from "uuid";
import { projectRoot } from "../utils/Paths.js";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const maxFileSize = 2 * 1024 * 1024;

function ensureDirectory(relativePath) {
  const fullPath = path.join(projectRoot, relativePath);
  fs.mkdirSync(fullPath, { recursive: true });

  return fullPath;
}

function createImageUpload(destinationRelativePath, fieldName) {
  const destination = ensureDirectory(destinationRelativePath);

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, destination),
      filename: (req, file, cb) => cb(null, `${guidV4()}-${file.originalname}`),
    }),
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Only jpg, jpeg, png and webp images are allowed."));
      }

      return cb(null, true);
    },
  }).single(fieldName);
}

export const uploadApiProfileImage = createImageUpload(
  path.join("public", "uploads", "images", "users", "profiles-pictures"),
  "profileImage"
);

export const uploadApiCommerceLogo = createImageUpload(
  path.join("public", "uploads", "images", "users", "commerce-logos"),
  "logo"
);

export const uploadApiProductImage = createImageUpload(
  path.join("public", "uploads", "images", "products"),
  "image"
);

export const uploadApiCommerceTypeIcon = createImageUpload(
  path.join("public", "uploads", "images", "commerce-types"),
  "icon"
);
