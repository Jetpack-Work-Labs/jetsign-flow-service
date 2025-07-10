import { Types } from "mongoose";

export interface IApplication {
  _id: Types.ObjectId;
  type: string;
  slug?: string;
  app_id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  user_cluster?: string;
  account_tier?: string;
  account_name?: string;
  account_slug?: string;
  account_max_users?: number;
  account_id: number;
  back_office_item_id?: number;
  version_data?: Record<string, any>;
  timestamp?: string;
  subscription?: Record<string, any>;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}
