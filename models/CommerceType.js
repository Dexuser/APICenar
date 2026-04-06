import mongoose from "mongoose";

const commerceTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'CommerceTypes' // Specify the collection name, is equivalent to table name in SQL
  }
);

const CommerceType = mongoose.model("CommerceType", commerceTypeSchema); // Create the model from the schema

export default CommerceType;
