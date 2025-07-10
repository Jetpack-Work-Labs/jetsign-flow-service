import { Document, Mixed } from "mongoose";
import { ISignerSettings } from "./signer";

export interface IEnvelope extends Document {
  type?: string;
  account_id: number;
  user_id?: number;
  board_id: number;
  item_id?: number;
  envelope_name?: string;
  is_deleted: boolean;
  presigned_file_column_id?: string;
  email_column_id?: string;
  status_column_id?: string;
  file_column_id?: string;
  sender_name?: string;
  email_address?: string;
  email_title?: Mixed;
  message?: string;
  deadline?: number;
  is_email_verified: boolean;
  email_verification_token?: string;
  email_verification_token_expires?: Date;
  itemViewInstanceId: number;
  two_factor_enforced?: boolean;
  get_copy_of_signed_document: boolean;
  logo?: string;
  default_language?: string;
  is_payment_enabled: boolean;
  payment_status_column?: string;
  payment_status_label?: string;
  payment_remainder_enabled: boolean;
  payment_remainder_days?: number;
  enable_sign_anywhere: boolean;
  payment_transaction_id_column?: string;
  useFileColumn: boolean;
  signatureCollection: {
    isEnabled: boolean;
    fileColumnId?: string;
    statusColumnId?: string;
    enableSignAnywhere: boolean;
    emailColumnId?: string;
    emailColumnType?: "email" | "people" | "mirror-email-column" | "text";
  };
  generateDocument: {
    isEnabled: boolean;
    statusColumnId?: string;
    statusColumnLabel?: string;
    outputColumnId?: string;
    outputFileType?: "pdf" | "docx" | "doc";
  };
  stripeConfiguration: {
    statusColumnId?: string;
    statusColumnLabel?: string;
    transactionIdColumnId?: string;
    isPaymentReminderEnabled: boolean;
    remindAfter?: number;
  };
  shareAndTrack: {
    isEnabled: boolean;
    statusColumnId?: string;
    statusColumnLabel?: string;
    outputColumnId?: string;
    invitationExpiry: boolean;
    numberOfDays?: number;
  };
  emailConfiguration: {
    defaultLanguage: string;
    emailAddress?: string;
    emailTitle?: Mixed;
    getCopyOfSignedDocument: boolean;
    message?: string;
    senderName?: string;
    triggerColumnId?: string;
    triggerColumnValue?: string;
    twoFactorEnforced: boolean;
    logo?: string;
  };
  status: string;
  verificationEmailSentAt?: Date;
  signerSettings: ISignerSettings;
  created_at: Date;
  updated_at: Date;
}
