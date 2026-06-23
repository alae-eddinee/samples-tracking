export type SampleStatus = "Sent" | "Returned" | "Lost";

export interface ISample {
  _id: string;
  client_name: string;
  sent_date: Date | string;
  returned_date?: Date | string | null;
  status: SampleStatus;
  image_url?: string;
  comment?: string;
  created_at: Date | string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
  active: boolean;
  created_at: Date | string;
  created_by?: string;
}

export interface ILog {
  _id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: "sample" | "user";
  target_id: string;
  target_label: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  timestamp: Date | string;
}
