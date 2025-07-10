import { model, Schema } from "mongoose";
import { IEnvelope, ISignerSettings } from "../interfaces";

const signerSettingsSchema = new Schema<ISignerSettings>({
  signers: {
    type: [Object],
  },
  isSigningOrderRequired: Boolean,
});

const schema = new Schema<IEnvelope>(
  {
    type: String,
    account_id: {
      type: Number,
      required: true,
      index: true,
    },
    user_id: {
      type: Number,
    },
    board_id: {
      type: Number,
      required: true,
    },
    item_id: {
      type: Number,
    },
    envelope_name: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    presigned_file_column_id: String,
    email_column_id: String,
    status_column_id: String,
    file_column_id: String,
    sender_name: String,
    email_address: String,
    email_title: Schema.Types.Mixed,
    message: String,
    deadline: Number,
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    email_verification_token: String,
    email_verification_token_expires: {
      type: Date,
    },
    itemViewInstanceId: {
      type: Number,
      required: true,
    },
    two_factor_enforced: Boolean,
    get_copy_of_signed_document: {
      type: Boolean,
      default: false,
    },
    logo: String,
    default_language: String,
    is_payment_enabled: {
      type: Boolean,
      default: false,
    },
    payment_status_column: String,
    payment_status_label: String,
    payment_remainder_enabled: {
      type: Boolean,
      default: false,
    },
    payment_remainder_days: Number,
    enable_sign_anywhere: {
      type: Boolean,
      default: false,
    },
    payment_transaction_id_column: String,
    useFileColumn: {
      type: Boolean,
      default: false,
    },
    signatureCollection: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      fileColumnId: String,
      statusColumnId: String,
      enableSignAnywhere: {
        type: Boolean,
        default: false,
      },
      emailColumnId: String,
      emailColumnType: {
        type: String,
        enum: ["email", "people", "mirror-email-column", "text"],
      },
    },
    generateDocument: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      statusColumnId: String,
      statusColumnLabel: String,
      outputColumnId: String,
      outputFileType: { type: String, enum: ["pdf", "docx", "doc"] },
    },
    stripeConfiguration: {
      statusColumnId: String,
      statusColumnLabel: String,
      transactionIdColumnId: String,
      isPaymentReminderEnabled: {
        type: Boolean,
        default: false,
      },
      remindAfter: Number,
    },
    shareAndTrack: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      statusColumnId: String,
      statusColumnLabel: String,
      outputColumnId: String,
      invitationExpiry: {
        type: Boolean,
        default: false,
      },
      numberOfDays: Number,
    },
    emailConfiguration: {
      defaultLanguage: {
        type: String,
        default: "en",
      },
      emailAddress: String,
      emailTitle: Schema.Types.Mixed,
      getCopyOfSignedDocument: {
        type: Boolean,
        default: false,
      },
      message: String,
      senderName: String,
      triggerColumnId: String,
      triggerColumnValue: String,
      twoFactorEnforced: {
        type: Boolean,
        default: false,
      },
      logo: String,
    },
    status: {
      type: String,
      default: "initialized",
    },
    verificationEmailSentAt: {
      type: Date,
    },
    signerSettings: signerSettingsSchema,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const EnvelopeModel = model<IEnvelope>("envelopes", schema);
