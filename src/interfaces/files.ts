import { Types } from "mongoose";

export interface IFileDetails extends Document {
  envelopeId?: Types.ObjectId;
  account_id: string;
  user_id?: string;
  board_id: number;
  item_id: number;
  file?: string;
  assetId?: number;
  temporary_file?: string;
  file_name?: string;
  is_deleted: boolean;
  type?: string;
  presigned_file_column_id?: string;
  email_column_id?: string;
  status_column_id?: string;
  file_column_id?: string;
  fields: Array<Record<string, any>>;
  sender_name?: string;
  email_address?: string;
  email_title?: any; // Mixed type
  message?: string;
  deadline?: number;
  is_email_verified: boolean;
  email_verification_token?: string;
  email_verification_token_expires?: Date;
  itemViewInstanceId: number;
  two_factor_enforced?: boolean;
  logo?: string;
  pages_added_by_users?: Array<any>;
  default_language?: string;
  fileType: "pdf" | "docx" | "doc";
  htmlContent?: string;
  templateId?: Types.ObjectId;
  isPinned: boolean;
  parentFileId?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}
