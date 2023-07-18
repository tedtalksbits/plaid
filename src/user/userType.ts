export type UserType = {
  id: number;
  name: string;
  username: string;
  password: string;
  client_id: string;
  access_token?: string | null;
  last_login?: Date | null;
  created_at?: string | null;
  updated_at?: string | null;
};
