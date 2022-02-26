import { ReactNode } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

interface MessagesPayload {
  messages: Message[];
}

export interface Message {
  type: string;
  message: ReactNode;
  time: string;
}

export function Messages({ messages }: MessagesPayload) {
  return (
    <div>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex flex-row items-center my-5 ${
            message.type === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          {message.type === 'bot' && (
            <div className="glow-0 flex justify-center">
              <UserOutlined
                className="w-8 h-8 flex justify-center items-center rounded-full"
                style={{ color: '#fff', backgroundColor: 'purple' }}
              />
            </div>
          )}

          <div
            className={`w-7/12 flex flex-row ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`inline-block ml-2 mr-2 pl-3 pr-3 pt-2 pb-2 bg-neutral-300 rounded-md ${
                message.type === 'user' ? 'bg-blue-500 text-white' : ''
              }`}
            >
              <p
                className={`leading-6 mb-0 pb-2 border-solid border-b border-neutral-400 ${
                  message.type === 'user' ? 'border-blue-600' : ''
                }`}
              >
                {message.message}
              </p>
              <p
                className={`leading-5 mb-0 pt-1 text-xs ${
                  message.type === 'user' ? 'text-slate-300' : 'text-gray-500'
                }`}
              >
                {format(new Date(message.time), 'yyyy-MM-dd HH:mm:ss')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
