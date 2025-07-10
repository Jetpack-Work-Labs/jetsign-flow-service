import { Schema, model } from "mongoose";
import encrypt from "mongoose-encryption";
import { IFileDetails } from "../interfaces";

const schema = new Schema<IFileDetails>(
  {
    envelopeId: { type: Schema.Types.ObjectId, ref: "Envelope" },
    account_id: { type: String, required: true, index: true },
    user_id: { type: String },
    board_id: { type: Number, required: true },
    item_id: { type: Number, required: true },
    file: { type: String },
    assetId: { type: Number, index: true },
    temporary_file: { type: String },
    file_name: { type: String },
    is_deleted: { type: Boolean, default: false },
    type: String,
    presigned_file_column_id: String,
    email_column_id: String,
    status_column_id: String,
    file_column_id: String,
    fields: [{}], // Array of arbitrary objects
    sender_name: String,
    email_address: String,
    email_title: Schema.Types.Mixed,
    message: String,
    deadline: Number,
    is_email_verified: { type: Boolean, default: false },
    email_verification_token: String,
    email_verification_token_expires: { type: Date },
    itemViewInstanceId: { type: Number, required: true },
    two_factor_enforced: Boolean,
    logo: String,
    pages_added_by_users: Array,
    default_language: String,
    fileType: { type: String, enum: ["pdf", "docx", "doc"], default: "pdf" },
    htmlContent: String,
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "template_gallery",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    parentFileId: {
      type: Schema.Types.ObjectId,
      ref: "FileDetails",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const FileDetailsModel = model<IFileDetails>("FileDetails", schema);
