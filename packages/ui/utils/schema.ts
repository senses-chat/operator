export interface WxkfAccount {
  open_kfid: string;
  name: string;
  avatar: string;
}

export interface WxkfDepartment {
  id: number;
  name?: string;
}

export interface WxkfUser {
  userid: string;
  name?: string;
  open_userid?: string;
}

export interface SessionData {
  id: string;
  source: {
    type: string;
    namespaces: string[];
  };
  destination: {
    type: string;
    namespaces: string[];
  };
  createdAt: string;
  updatedAt: string;
  count: number;
  expiredAt: string;
}
