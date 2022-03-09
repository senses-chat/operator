import { registerAs } from '@nestjs/config';

export default registerAs('rasa', () => ({
  // default 750ms
  messageDelay: Number(process.env.RASA_MESSAGE_DELAY || 750),

  // default 15mins, in ms
  pingInterval: Number(process.env.RASA_PING_INTERVAL_MINUTES || 15) * 60 * 1000,

  maxLatenciesHistory: Number(process.env.RASA_MAX_LATENCIES_HISTORY || 3),
}));
