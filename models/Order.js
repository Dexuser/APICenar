import mongoose from "mongoose";
import OrderStatus from "./enums/orderStatus.js";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Order must include at least one item.",
      },
    },

    client: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        default: null,
      },
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    address: {
      label: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      sector: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      reference: {
        type: String,
        required: true,
      },
    },

    commerce: {
      commerceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      logo: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
    },

    delivery: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      firstName: {
        type: String,
        default: null,
      },
      lastName: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
      profileImage: {
        type: String,
        default: null,
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    itbisPercentage: {
      type: Number,
      required: true,
      min: 0,
    },

    itbisAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "Orders",
  }
);

orderSchema.index({ "client.userId": 1, createdAt: -1 });
orderSchema.index({ "commerce.commerceId": 1, createdAt: -1 });
orderSchema.index({ "delivery.userId": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
