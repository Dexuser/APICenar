import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    commerceId: { // Aqui va un user de tipo Commerce
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'Categories' // Specify the collection name, is equivalent to table name in SQL
  }
);

const Category = mongoose.model("Category", categorySchema); // Create the model from the schema

export default Category;
