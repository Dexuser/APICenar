import bcrypt from "bcrypt";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import OrderStatus from "../../models/enums/orderStatus.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

function buildUserFilters(role, query) {
  const filters = { role };
  const search = String(query.search || "").trim();

  if (query.isActive !== undefined) {
    filters.isActive = String(query.isActive).toLowerCase() === "true";
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    if (role === UserRoles.COMMERCE) {
      filters.$or = [
        { commerceName: regex },
        { email: regex },
        { phone: regex },
      ];
    } else {
      filters.$or = [
        { firstName: regex },
        { lastName: regex },
        { username: regex },
        { email: regex },
        { phone: regex },
      ];
    }
  }

  return filters;
}

async function buildUserList(req, role, serializer, options = {}) {
  const { page, pageSize, skip, sort } = getListQueryOptions(req.query, {
    defaultSortBy: options.defaultSortBy || "createdAt",
    defaultSortDirection: options.defaultSortDirection || "desc",
    allowedSortFields: options.allowedSortFields || ["createdAt", "updatedAt"],
    sortFieldMap: options.sortFieldMap || {},
  });

  const filters = buildUserFilters(role, req.query);

  const [users, total] = await Promise.all([
    User.find(filters).sort(sort).skip(skip).limit(pageSize).lean(),
    User.countDocuments(filters),
  ]);

  const items = await Promise.all(users.map((user) => serializer(user, req)));

  return buildPaginatedResult(items, total, page, pageSize);
}

function canModifyAdmin(authenticatedUserId, targetUser) {
  if (targetUser.isDefaultAdmin) {
    return false;
  }

  return targetUser._id.toString() !== authenticatedUserId.toString();
}

async function ensureUniqueAdminFields(userName, email, ignoredUserId = null) {
  const userNameFilter = { username: userName };
  const emailFilter = { email: email.toLowerCase() };

  if (ignoredUserId) {
    userNameFilter._id = { $ne: ignoredUserId };
    emailFilter._id = { $ne: ignoredUserId };
  }

  const existingUserName = await User.findOne(userNameFilter).lean();

  if (existingUserName) {
    return "userName already exists.";
  }

  const existingEmail = await User.findOne(emailFilter).lean();

  if (existingEmail) {
    return "email already exists.";
  }

  return null;
}

export async function getClients(req, res) {
  return sendSuccess(
    res,
    200,
    await buildUserList(
      req,
      UserRoles.CLIENT,
      async (user) => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        email: user.email,
        isActive: user.isActive,
        ordersCount: await Order.countDocuments({ "client.userId": user._id }),
      }),
      {
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "firstName", "lastName", "email", "isActive"],
      }
    )
  );
}

export async function getDeliveries(req, res) {
  return sendSuccess(
    res,
    200,
    await buildUserList(
      req,
      UserRoles.DELIVERY,
      async (user) => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        email: user.email,
        isActive: user.isActive,
        deliveredOrdersCount: await Order.countDocuments({
          "delivery.userId": user._id,
          status: OrderStatus.COMPLETED,
        }),
      }),
      {
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "firstName", "lastName", "email", "isActive"],
      }
    )
  );
}

export async function getCommerces(req, res) {
  return sendSuccess(
    res,
    200,
    await buildUserList(
      req,
      UserRoles.COMMERCE,
      async (user) => ({
        id: user._id.toString(),
        name: user.commerceName,
        logo: user.commerceLogo || null,
        phone: user.phone || null,
        email: user.email,
        openingTime: user.openTime,
        closingTime: user.closeTime,
        isActive: user.isActive,
        ordersCount: await Order.countDocuments({
          "commerce.commerceId": user._id,
        }),
      }),
      {
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "commerceName", "email", "isActive", "openTime", "closeTime"],
        sortFieldMap: {
          name: "commerceName",
          openingTime: "openTime",
          closingTime: "closeTime",
        },
      }
    )
  );
}

export async function getAdministrators(req, res) {
  return sendSuccess(
    res,
    200,
    await buildUserList(
      req,
      UserRoles.ADMIN,
      async (user) => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.username,
        phone: user.phone || null,
        email: user.email,
        isActive: user.isActive,
        isDefaultAdmin: !!user.isDefaultAdmin,
        canModify: canModifyAdmin(req.user._id, user),
      }),
      {
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "firstName", "lastName", "username", "email", "isActive"],
        sortFieldMap: {
          userName: "username",
        },
      }
    )
  );
}

export async function createAdministrator(req, res) {
  const uniquenessError = await ensureUniqueAdminFields(
    req.body.userName,
    req.body.email
  );

  if (uniquenessError) {
    return sendError(res, 409, uniquenessError);
  }

  const admin = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.userName,
    email: req.body.email.toLowerCase(),
    password: await bcrypt.hash(req.body.password, 10),
    phone: req.body.phone,
    role: UserRoles.ADMIN,
    isActive: true,
    isDefaultAdmin: false,
  });

  return sendSuccess(res, 201, {
    id: admin._id.toString(),
    firstName: admin.firstName,
    lastName: admin.lastName,
    userName: admin.username,
    email: admin.email,
    phone: admin.phone || null,
    role: admin.role,
    isActive: admin.isActive,
  });
}

export async function updateAdministrator(req, res) {
  const admin = await User.findOne({
    _id: req.params.id,
    role: UserRoles.ADMIN,
  });

  if (!admin) {
    return sendError(res, 404, "Administrator not found.");
  }

  if (!canModifyAdmin(req.user._id, admin)) {
    return sendError(res, 403, "This administrator cannot be modified.");
  }

  const uniquenessError = await ensureUniqueAdminFields(
    req.body.userName,
    req.body.email,
    admin._id
  );

  if (uniquenessError) {
    return sendError(res, 409, uniquenessError);
  }

  admin.firstName = req.body.firstName;
  admin.lastName = req.body.lastName;
  admin.username = req.body.userName;
  admin.email = req.body.email.toLowerCase();
  admin.phone = req.body.phone;

  if (req.body.password) {
    admin.password = await bcrypt.hash(req.body.password, 10);
  }

  await admin.save();

  return sendSuccess(res, 200, {
    id: admin._id.toString(),
    firstName: admin.firstName,
    lastName: admin.lastName,
    userName: admin.username,
    email: admin.email,
    phone: admin.phone || null,
    role: admin.role,
    isActive: admin.isActive,
  });
}

export async function updateUserStatus(req, res) {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return sendError(res, 404, "User not found.");
  }

  if (targetUser.role === UserRoles.ADMIN && !canModifyAdmin(req.user._id, targetUser)) {
    return sendError(res, 403, "This user status cannot be changed.");
  }

  targetUser.isActive = req.body.isActive;
  await targetUser.save();

  return sendSuccess(res, 200, {
    id: targetUser._id.toString(),
    role: targetUser.role,
    isActive: targetUser.isActive,
  });
}
