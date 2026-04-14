import Address from "../../models/Address.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import OrderStatus from "../../models/enums/orderStatus.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  getListQueryOptions,
} from "../../utils/apiQuery.js";
import { getConfigurationValue } from "../../utils/configuration.js";

function roundCurrency(value) {
  return Number(Number(value).toFixed(2));
}

function normalizeOrderStatus(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue === "pending") {
    return OrderStatus.PENDING;
  }

  if (normalizedValue === "inprogress" || normalizedValue === "in_progress") {
    return OrderStatus.IN_PROGRESS;
  }

  if (normalizedValue === "completed" || normalizedValue === "complete") {
    return OrderStatus.COMPLETED;
  }

  return null;
}

function getItemCount(order) {
  return order.items.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function serializeOrderSummary(order, viewerRole) {
  const base = {
    id: order._id.toString(),
    status: order.status,
    total: order.total,
    itemsCount: getItemCount(order),
    createdAt: order.createdAt,
  };

  if (viewerRole === UserRoles.CLIENT) {
    base.commerce = {
      id: order.commerce.commerceId.toString(),
      name: order.commerce.name,
      logo: order.commerce.logo || null,
    };
  }

  if (viewerRole === UserRoles.COMMERCE) {
    base.client = {
      id: order.client.userId.toString(),
      firstName: order.client.firstName,
      lastName: order.client.lastName,
      email: order.client.email,
      phone: order.client.phone || null,
    };
    base.canAssignDelivery = order.status === OrderStatus.PENDING;
    base.deliveryAssigned = !!order.delivery?.userId;
  }

  if (viewerRole === UserRoles.DELIVERY) {
    base.commerce = {
      id: order.commerce.commerceId.toString(),
      name: order.commerce.name,
      logo: order.commerce.logo || null,
    };
    base.client = {
      id: order.client.userId.toString(),
      firstName: order.client.firstName,
      lastName: order.client.lastName,
    };
  }

  return base;
}

function serializeOrderDetail(order, options = {}) {
  const hideAddress = options.hideAddress || false;
  const includeCanAssignDelivery = options.includeCanAssignDelivery || false;

  const payload = {
    id: order._id.toString(),
    status: order.status,
    clientId: order.client.userId.toString(),
    commerceId: order.commerce.commerceId.toString(),
    subtotal: order.subtotal,
    itbisPercentage: order.itbisPercentage,
    itbisAmount: order.itbisAmount,
    total: order.total,
    createdAt: order.createdAt,
    assignedAt: order.assignedAt,
    completedAt: order.completedAt,
    client: {
      id: order.client.userId.toString(),
      firstName: order.client.firstName,
      lastName: order.client.lastName,
      email: order.client.email,
      phone: order.client.phone || null,
    },
    commerce: {
      id: order.commerce.commerceId.toString(),
      name: order.commerce.name,
      logo: order.commerce.logo || null,
      phone: order.commerce.phone || null,
    },
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      description: item.description || null,
      image: item.image || null,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  };

  if (!hideAddress) {
    payload.addressId = order.addressId.toString();
    payload.address = {
      id: order.addressId.toString(),
      label: order.address.label,
      street: order.address.street,
      sector: order.address.sector,
      city: order.address.city,
      reference: order.address.reference,
    };
  }

  if (order.delivery?.userId) {
    payload.delivery = {
      id: order.delivery.userId.toString(),
      firstName: order.delivery.firstName,
      lastName: order.delivery.lastName,
      email: order.delivery.email,
      phone: order.delivery.phone || null,
      profileImage: order.delivery.profileImage || null,
    };
  } else {
    payload.delivery = null;
  }

  if (includeCanAssignDelivery) {
    payload.canAssignDelivery = order.status === OrderStatus.PENDING;
  }

  return payload;
}

async function getAvailableDelivery() {
  const deliveries = await User.find({
    role: UserRoles.DELIVERY,
    isActive: true,
    isBusy: false,
  }).sort({ createdAt: 1 });

  for (const delivery of deliveries) {
    const hasInProgressOrder = await Order.exists({
      "delivery.userId": delivery._id,
      status: OrderStatus.IN_PROGRESS,
    });

    if (!hasInProgressOrder) {
      return delivery;
    }
  }

  return null;
}

async function buildListResponse(filters, req, viewerRole) {
  const { page, pageSize, skip, sort } = getListQueryOptions(req.query, {
    defaultSortBy: "createdAt",
    defaultSortDirection: "desc",
    allowedSortFields: ["createdAt", "updatedAt", "total", "status"],
  });

  const [orders, total] = await Promise.all([
    Order.find(filters).sort(sort).skip(skip).limit(pageSize).lean(),
    Order.countDocuments(filters),
  ]);

  return buildPaginatedResult(
    orders.map((order) => serializeOrderSummary(order, viewerRole)),
    total,
    page,
    pageSize
  );
}

export async function createOrder(req, res) {
  const address = await Address.findOne({
    _id: req.body.addressId,
    userId: req.user._id,
  }).lean();

  if (!address) {
    return sendError(res, 404, "Address not found.");
  }

  const productIds = req.body.items.map((item) => item.productId.toString());
  const uniqueProductIds = [...new Set(productIds)];
  const products = await Product.find({
    _id: { $in: uniqueProductIds },
    isActive: true,
  }).lean();

  if (products.length !== uniqueProductIds.length) {
    return sendError(res, 404, "One or more products were not found.");
  }

  const productsById = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  const commerceIds = new Set(products.map((product) => product.commerceId.toString()));

  if (commerceIds.size !== 1) {
    return sendError(
      res,
      400,
      "All products in the order must belong to the same commerce."
    );
  }

  const commerceId = products[0].commerceId.toString();
  const commerce = await User.findOne({
    _id: commerceId,
    role: UserRoles.COMMERCE,
    isActive: true,
  }).lean();

  if (!commerce) {
    return sendError(res, 404, "Commerce not found.");
  }

  const items = req.body.items.map((requestedItem) => {
    const product = productsById.get(requestedItem.productId);
    const quantity = Number(requestedItem.quantity);
    const lineTotal = roundCurrency(product.price * quantity);

    return {
      productId: product._id,
      name: product.name,
      description: product.description || null,
      image: product.image || null,
      price: product.price,
      quantity,
      lineTotal,
    };
  });

  const subtotal = roundCurrency(
    items.reduce((total, item) => total + item.lineTotal, 0)
  );
  const itbisPercentage = Number(await getConfigurationValue("ITBIS", 18));
  const itbisAmount = roundCurrency(subtotal * (itbisPercentage / 100));
  const total = roundCurrency(subtotal + itbisAmount);

  const order = await Order.create({
    items,
    client: {
      userId: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone || null,
    },
    addressId: address._id,
    address: {
      label: address.label,
      street: address.street,
      sector: address.sector,
      city: address.city,
      reference: address.reference,
    },
    commerce: {
      commerceId: commerce._id,
      name: commerce.commerceName,
      logo: commerce.commerceLogo || null,
      phone: commerce.phone || null,
    },
    subtotal,
    itbisPercentage,
    itbisAmount,
    total,
    status: OrderStatus.PENDING,
  });

  return sendSuccess(res, 201, {
    id: order._id.toString(),
    status: order.status,
    commerceId: order.commerce.commerceId.toString(),
    clientId: order.client.userId.toString(),
    addressId: order.addressId.toString(),
    subtotal: order.subtotal,
    itbisPercentage: order.itbisPercentage,
    itbisAmount: order.itbisAmount,
    total: order.total,
    createdAt: order.createdAt,
  });
}

export async function getMyOrders(req, res) {
  const filters = {
    "client.userId": req.user._id,
  };

  const normalizedStatus = normalizeOrderStatus(req.query.status);

  if (req.query.status) {
    filters.status = normalizedStatus;
  }

  return sendSuccess(
    res,
    200,
    await buildListResponse(filters, req, UserRoles.CLIENT)
  );
}

export async function getMyOrderDetail(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    "client.userId": req.user._id,
  }).lean();

  if (!order) {
    return sendError(res, 404, "Order not found.");
  }

  return sendSuccess(res, 200, serializeOrderDetail(order));
}

export async function getCommerceOrders(req, res) {
  const filters = {
    "commerce.commerceId": req.user._id,
  };

  const normalizedStatus = normalizeOrderStatus(req.query.status);

  if (req.query.status) {
    filters.status = normalizedStatus;
  }

  return sendSuccess(
    res,
    200,
    await buildListResponse(filters, req, UserRoles.COMMERCE)
  );
}

export async function getCommerceOrderDetail(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    "commerce.commerceId": req.user._id,
  }).lean();

  if (!order) {
    return sendError(res, 404, "Order not found.");
  }

  return sendSuccess(
    res,
    200,
    serializeOrderDetail(order, { includeCanAssignDelivery: true })
  );
}

export async function assignDeliveryAutomatically(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    "commerce.commerceId": req.user._id,
  });

  if (!order) {
    return sendError(res, 404, "Order not found.");
  }

  if (order.status !== OrderStatus.PENDING) {
    return sendError(res, 400, "Only pending orders can be assigned.");
  }

  const delivery = await getAvailableDelivery();

  if (!delivery) {
    return sendError(res, 409, "No delivery is currently available.");
  }

  order.status = OrderStatus.IN_PROGRESS;
  order.assignedAt = new Date();
  order.delivery = {
    userId: delivery._id,
    firstName: delivery.firstName,
    lastName: delivery.lastName,
    email: delivery.email,
    phone: delivery.phone || null,
    profileImage: delivery.profilePicture || null,
  };

  delivery.isBusy = true;

  await order.save();
  await delivery.save();

  return sendSuccess(res, 200, {
    id: order._id.toString(),
    status: order.status,
    delivery: {
      id: delivery._id.toString(),
      firstName: delivery.firstName,
      lastName: delivery.lastName,
      email: delivery.email,
    },
    assignedAt: order.assignedAt,
  });
}

export async function getDeliveryOrders(req, res) {
  const filters = {
    "delivery.userId": req.user._id,
  };

  const normalizedStatus = normalizeOrderStatus(req.query.status);

  if (req.query.status) {
    filters.status = normalizedStatus;
  }

  return sendSuccess(
    res,
    200,
    await buildListResponse(filters, req, UserRoles.DELIVERY)
  );
}

export async function getDeliveryOrderDetail(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    "delivery.userId": req.user._id,
  }).lean();

  if (!order) {
    return sendError(res, 404, "Order not found.");
  }

  return sendSuccess(
    res,
    200,
    serializeOrderDetail(order, {
      hideAddress: order.status === OrderStatus.COMPLETED,
    })
  );
}

export async function completeOrder(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    "delivery.userId": req.user._id,
  });

  if (!order) {
    return sendError(res, 404, "Order not found.");
  }

  if (order.status !== OrderStatus.IN_PROGRESS) {
    return sendError(res, 400, "Only orders in progress can be completed.");
  }

  order.status = OrderStatus.COMPLETED;
  order.completedAt = new Date();
  await order.save();

  req.user.isBusy = false;
  await req.user.save();

  return sendSuccess(res, 200, {
    id: order._id.toString(),
    status: order.status,
    completedAt: order.completedAt,
  });
}
