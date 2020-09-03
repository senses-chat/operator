import { NewWechatyMessageCommand } from './new-msg.command';
import { SendWechatyMessageCommand } from './send-msg.command';
import { NewWechatyMessageCommandHandler } from './handlers/new-msg.handler';
import { SendWechatyMessageCommandHandler } from './handlers/send-msg.handler';

export { NewWechatyMessageCommand, SendWechatyMessageCommand, NewWechatyMessageCommandHandler, SendWechatyMessageCommandHandler };

export const CommandHandlers = [NewWechatyMessageCommandHandler, SendWechatyMessageCommandHandler];
