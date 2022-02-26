export interface RasaWebhookPayload {
  sender: string;
  message: string;
}

export interface RasaResponsePayload {
  recipient_id: string;
  text: string;
  buttons?: any[]; // TODO: rasa buttons payload
  image?: string;
  custom?: any;
}

// export enum RequestAccept {
//   JSON = 'application/json',
//   YAML = 'application/x-yml',
// }
