import mongoose from "mongoose";
import path from "path";
import { config } from "../config";
// const caPath = path.resolve(__dirname, "../../", "global-bundle.pem"); // Update with actual path

export const connectDB = async (connection_uri: string): Promise<void> => {
  try {
    await mongoose.connect(connection_uri, {
      tls: true,
      // tlsCAFile: caPath,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: false,
    });
    if (config.env === "development") {
      mongoose.set("debug", true);
    }

    mongoose.set("strictQuery", true);
    console.log("Connected to mongoose");
    mongoose.connection.on("connected", () =>
      console.log("Mongoose connected")
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("Mongoose disconnected")
    );
    mongoose.connection.on("error", (err) =>
      console.error("Mongoose connection error:", err)
    );
  } catch (error) {
    console.error("Error while connecting to mongoose", error);
  }
};
