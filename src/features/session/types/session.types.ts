export interface Session {
  _id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  last_used_at: string;
  current: boolean;
}

export interface GetSessionsResponse {
  ok: boolean;
  sessions: Session[];
}
