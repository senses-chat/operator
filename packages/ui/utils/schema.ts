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
