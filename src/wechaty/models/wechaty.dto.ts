export interface WechatyMessage {
  text: string;
}

export interface WorkerDataPayload {
  name: string;
  puppet: string;
  token: string;
}

export interface EventPayload {
  eventName: string;
  payload: any;
}
