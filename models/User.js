import mongoose from "mongoose";
import userRoles from "./enums/userRoles.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    username: {
      type: String,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    profilePicture: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: Object.values(userRoles),
      required: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      required: true
    },

    resetToken: {
      type: String,
      default: null
    },

    resetTokenExpiration: {
      type: Date,
      default: null
    },

    ActivateToken: {
      type: String,
      default: null
    },

    // comercios
    commerceName: {
      type: String
    },

    commerceLogo: {
      type: String,
    },

    openTime: {
      type: String,
      required: function () {
        return this.role === 'commerce';
      },
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },

    closeTime: {
      type: String,
      required: function () {
        return this.role === 'commerce';
      },
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },

    commerceTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommerceType",
    },

    // Delivery
    isBusy: {type: Boolean, default: false} // si es true el dilevery esta ocupado, de lo contrario, NO ESTA OCUPADO


  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'Users' // Specify the collection name, is equivalent to table name in SQL
  }
);

const User = mongoose.model("User", userSchema); // Create the model from the schema

export default User;
