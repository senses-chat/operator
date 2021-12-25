import { registerAs } from '@nestjs/config';

export default registerAs('rasa', () => ({
  messageDelay: Number(process.env.RASA_MESSAGE_DELAY || 750),
}));
