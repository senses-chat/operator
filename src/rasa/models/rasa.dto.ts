export interface RasaWebhookPayload {
  sender: string;
  message: string;
}

export interface RasaResponsePayload {
  recipient_id: string;
  text: string;
}

export enum RequestAccept {
  JSON = 'application/json',
  YAML = 'application/x-yml',
}
