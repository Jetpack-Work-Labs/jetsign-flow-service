import { Schema, model, Document } from "mongoose";
import encrypt from "mongoose-encryption";
import { IUser } from "../interfaces";
import { config } from "../config";

const schema = new Schema<IUser>(
  {
    account_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    board_id: {
      type: Number,
      required: true,
    },
    workspace_id: Number,
    item_id: {
      type: Number,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    editorOnboarded: {
      type: Boolean,
      default: false,
    },
    isInitialLoad: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

schema.plugin(encrypt, {
  encryptionKey: config.encryption.encKey,
  signingKey: config.encryption.sigKey,
  encryptedFields: ["accessToken"],
});

export const UserModel = model<IUser>("User", schema);
