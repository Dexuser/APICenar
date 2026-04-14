import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    label: {
      type: String,
      required: true
    },

    street: {
      type: String,
      required: true
    },

    sector: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    reference: {
      type: String,
      required: true
    },

    // Legacy fields kept to avoid breaking older parts of the project while the API migration is in progress.
    title: {
      type: String,
      default: null
    },

    description: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "Adresses"
  }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
