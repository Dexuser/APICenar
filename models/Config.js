import mongoose from "mongoose";

const ConfigSchema = new mongoose.Schema(
  {
    itebis: {
      type: Number,
      required: true,
      default: 18,
    }
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'Config' // Specify the collection name, is equivalent to table name in SQL
  }
);

const Config = mongoose.model("Config", ConfigSchema); // Create the model from the schema

export default Config;
