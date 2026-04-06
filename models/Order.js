import mongoose from "mongoose";
import orderStatus from "./enums/orderStatus.js";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: {
          type: String,
          required: true
        },
        image: {
          type: String
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    client: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      firstName: {
        type: String,
        required: true
      },
      lastName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String
      }
    },

    address: {
        title: {
            type: String,
            required: true
        },
        description: {
          type: String,
          required: true
        }
    },

    commerce: {
      commerceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      businessName: {
        type: String,
        required: true
      },
      logo: {
        type: String
      }
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    itebis: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    state: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PENDING
    }
  },
  {
    timestamps: true,
    collection: "Orders"
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;