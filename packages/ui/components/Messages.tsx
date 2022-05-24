import { ReactNode, useState } from 'react';
import { Button, Modal } from 'antd';
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sceneValue, setSceneValue] = useState(null);

  function toggleExpand(index: number) {
    if (expands.includes(index)) {
      setExpands([...expands.filter((i) => i !== index)]);
    } else {
      setExpands([...expands, index]);
    }
  }

  function onOpenSceneModal(value) {
    setSceneValue(value);
    setIsModalVisible(true);
  }

  return (
    <div>
      {messages.map((message, index) => {
        if (message.message === '/greet' || message.message === 'enter_session') {
          return (
            <div key={index} className="flex flex-col items-center text-gray-500 m-2" id={`message-${index}`}>
              <p className='m-2'>{format(new Date(message.time), 'yyyy-MM-dd HH:mm:ss')}</p>
              <p className='bg-gray-300 py-1 px-3 rounded-sm'>会话开始，点击查看<Button type='link' className='p-0' onClick={() => onOpenSceneModal(message.metadata.scene)}>场景详情</Button></p>
            </div>
          );
        }

        if (message.message === '/bye' || message.message === 'session_status_change') {
          return (
            <div key={index} className="flex flex-col items-center text-gray-500 m-2" id={`message-${index}`}>
              <p className='bg-gray-300 py-1 px-3 rounded-sm'>会话结束</p>
            </div>
          );
        }

        if (message.message === '/redirect') {
          return (
            <div key={index} className="flex flex-col items-center text-gray-500 m-2" id={`message-${index}`}>
              <p className='bg-gray-300 py-1 px-3 rounded-sm'>转接人工客服</p>
            </div>
          );
        }

        return (
          <div
            key={index}
            className={`flex flex-row items-center my-5 ${
              message.type === 'bot' ? 'flex-row-reverse' : ''
            }`}
            id={`message-${index}`}
          >
            {message.type === 'user' && (
              <div className="glow-0 flex justify-center">
                <UserOutlined
                  className="w-8 h-8 flex justify-center items-center rounded-full"
                  style={{ color: '#fff', backgroundColor: 'purple' }}
                />
              </div>
            )}
  
            <div
              className={`w-7/12 flex flex-row ${
                message.type === 'bot' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`inline-block ml-2 mr-2 pl-3 pr-3 pt-2 pb-2 bg-neutral-300 rounded-md ${
                  message.type === 'bot' ? 'bg-blue-500 text-white' : ''
                }`}
              >
                <div className={`flex flex-row justify-between pb-2 border-solid border-b border-neutral-400 ${
                  message.type === 'bot' ? 'border-blue-600' : ''
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
                        className={`inline-block ml-2 mr-2 pl-3 pr-3 pt-2 pb-2 bg-neutral-300 rounded-md ${message.type === 'bot' ? 'bg-blue-500 text-white' : ''
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
                    message.type === 'bot' ? 'text-slate-300' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(message.time), 'yyyy-MM-dd HH:mm:ss')}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      <Modal
        title={`场景值`}
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>{sceneValue}</p>
      </Modal>
    </div>
  );
}
