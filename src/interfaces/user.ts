export interface IUser {
  account_id: string;
  user_id: string;
  board_id: number;
  workspace_id?: number;
  item_id: number;
  accessToken: string;
  editorOnboarded?: boolean;
  isInitialLoad?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
