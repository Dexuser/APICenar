import path from "path";
import Category from "../../models/Category.js";
import Product from "../../models/Product.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

function toPublicFilePath(file) {
  if (!file) {
    return null;
  }

  return `\\${path.relative("public", file.path)}`.replaceAll("\\\\", "\\");
}

function serializeProduct(product) {
  const category = product.categoryId;

  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    isActive: product.isActive,
    commerceId: product.commerceId.toString(),
    categoryId: category?._id?.toString?.() || product.categoryId?.toString?.() || null,
    category: category?._id
      ? {
          id: category._id.toString(),
          name: category.name,
          description: category.description,
        }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function ensureCategoryBelongsToCommerce(categoryId, commerceId) {
  return Category.findOne({
    _id: categoryId,
    commerceId,
  });
}

export async function getMyProducts(req, res) {
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "createdAt",
    defaultSortDirection: "desc",
    allowedSortFields: ["createdAt", "updatedAt", "name", "price"],
  });

  const filters = {
    commerceId: req.user._id,
    isActive: true,
  };

  if (req.query.categoryId) {
    filters.categoryId = req.query.categoryId;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filters.$or = [{ name: regex }, { description: regex }];
  }

  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate("categoryId")
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filters),
  ]);

  return sendSuccess(
    res,
    200,
    buildPaginatedResult(
      products.map(serializeProduct),
      total,
      page,
      pageSize
    )
  );
}

export async function getProductById(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    commerceId: req.user._id,
    isActive: true,
  })
    .populate("categoryId")
    .lean();

  if (!product) {
    return sendError(res, 404, "Product not found.");
  }

  return sendSuccess(res, 200, serializeProduct(product));
}

export async function createProduct(req, res) {
  if (!req.file) {
    return sendError(res, 400, "image is required.");
  }

  const category = await ensureCategoryBelongsToCommerce(
    req.body.categoryId,
    req.user._id
  );

  if (!category) {
    return sendError(res, 400, "categoryId does not belong to the authenticated commerce.");
  }

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    image: toPublicFilePath(req.file),
    categoryId: category._id,
    commerceId: req.user._id,
    isActive: true,
  });

  await product.populate("categoryId");

  return sendSuccess(res, 201, serializeProduct(product));
}

export async function updateProduct(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    commerceId: req.user._id,
    isActive: true,
  });

  if (!product) {
    return sendError(res, 404, "Product not found.");
  }

  const category = await ensureCategoryBelongsToCommerce(
    req.body.categoryId,
    req.user._id
  );

  if (!category) {
    return sendError(res, 400, "categoryId does not belong to the authenticated commerce.");
  }

  product.name = req.body.name;
  product.description = req.body.description;
  product.price = Number(req.body.price);
  product.categoryId = category._id;

  if (req.file) {
    product.image = toPublicFilePath(req.file);
  }

  await product.save();
  await product.populate("categoryId");

  return sendSuccess(res, 200, serializeProduct(product));
}

export async function deleteProduct(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    commerceId: req.user._id,
    isActive: true,
  });

  if (!product) {
    return sendError(res, 404, "Product not found.");
  }

  product.isActive = false;
  await product.save();

  return res.status(204).send();
}
