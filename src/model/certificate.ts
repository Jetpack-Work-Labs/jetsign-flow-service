import { Schema, model } from "mongoose";
import { Icertificate } from "../interfaces";

const schema = new Schema<Icertificate>(
  {
    account_id: {
      type: Number,
      required: true,
      index: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    docker_file_path: {
      type: String,
      required: true,
    },
    workerId: {
      type: String,
      required: false,
    },
    tokenId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const CertificateModel = model<Icertificate>("certificates", schema);
