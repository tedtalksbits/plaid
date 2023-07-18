type SessionUser = {
  client_id: string;
  user_id: number;
  username: string;
};

type RequestSession = {
  token: string;
  user: SessionUser;
};

declare namespace Express {
  export interface Request {
    session: RequestSession;
  }
}
