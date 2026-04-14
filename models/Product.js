import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true},
    isActive: {type: Boolean, default: true},
    categoryId: { // Aqui va un user de tipo Commerce
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    commerceId: { // Aqui va un user de tipo Commerce
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'Products' // Specify the collection name, is equivalent to table name in SQL
  }
);

const Product = mongoose.model("Product", productSchema); // Create the model from the schema

export default Product;
