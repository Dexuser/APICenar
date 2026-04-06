import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js"
import Favorite from "../models/Favorite.js"
import Config from "../models/Config.js"
import CommerceType from "../models/CommerceType.js"
import Category from "../models/Category.js"
import Address from "../models/Address.js"
import seedDefaultAdminUser from "../seeds/adminSeed.js";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    const models = [
      User,
      Category,
      Product,
      Order,
      Favorite,
      CommerceType,
      Config,
      Address
    ];

    for (const model of models) {
      await model.createCollection();
      await model.syncIndexes();

      console.log(`Collection ready: ${model.collection.name}`);
    }
    console.log("Database initialized successfully");

    await seedDefaultAdminUser(User);


  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
