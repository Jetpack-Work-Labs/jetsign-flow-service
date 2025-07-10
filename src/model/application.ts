import { Schema, model, Document } from "mongoose";
import { IApplication } from "../interfaces";

const schema = new Schema<IApplication>(
  {
    type: {
      type: String,
      required: true,
    },
    slug: String,
    app_id: {
      type: Number,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    user_email: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_cluster: String,
    account_tier: String,
    account_name: String,
    account_slug: String,
    account_max_users: {
      type: Number,
    },
    account_id: {
      type: Number,
      required: true,
      index: true,
    },
    back_office_item_id: {
      type: Number,
      index: true,
    },
    version_data: Object,
    timestamp: String,
    subscription: Object,
    status: {
      type: String,
      default: "initialized",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const ApplicationModel = model<IApplication>("application", schema);
