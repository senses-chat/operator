import { ReactNode, useState } from 'react';
import { UserOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

interface MessagesPayload {
  messages: Message[];
}

export interface Message {
  type: string;
  message: ReactNode;
  time: string;
  metadata: any;
}

export function Messages({ messages }: MessagesPayload) {
  const [expands, setExpands] = useState([]);

  function toggleExpand(index: number) {
    if (expands.includes(index)) {
      setExpands([...expands.filter((i) => i !== index)]);
    } else {
      setExpands([...expands, index]);
    }
  }

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
              <div className={`flex flex-row justify-between pb-2 border-solid border-b border-neutral-400 ${
                message.type === 'user' ? 'border-blue-600' : ''
              }`}>
                <p
                  className={`grow leading-6`}
                >
                  {message.message}
                </p>
                {
                  message.metadata && (
                    <div className="flex justify-center items-center cursor-pointer" onClick={() => toggleExpand(index)}>
                      {
                        expands.includes(index) ? (
                          <DownOutlined />
                        ) : (
                          <UpOutlined />
                        )
                      }
                    </div>
                  )
                }
              </div>
              {
                message.metadata && (
                  <div className={`${expands.includes(index) ? 'max-h-60' : 'max-h-0'} overflow-y-hidden`}>
                    <p
                      className={`inline-block ml-2 mr-2 pl-3 pr-3 pt-2 pb-2 bg-neutral-300 rounded-md ${message.type === 'user' ? 'bg-blue-500 text-white' : ''
                        }`}
                    >
                      <pre>
                        {JSON.stringify(message.metadata, null, 2)}
                      </pre>
                    </p>
                  </div>
                )
              }
              <p
                className={`leading-5 pt-1 text-xs ${
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
