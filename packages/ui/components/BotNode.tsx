import { Avatar } from 'antd';
import { WechatOutlined, RobotOutlined } from '@ant-design/icons';
import { url, fetcher } from 'utils/request';
import useSWR, { SWRResponse } from 'swr';
import { WxkfAccount } from 'utils/schema';

interface BotNodePayload {
  type: string;
  namespaces: string[];
  className?: string
}

export function BotNode({ type, namespaces, className }: BotNodePayload) {
  const { data: wxkfData }: SWRResponse<WxkfAccount[], Error> = useSWR(
    url(`/api/wxkf/account`),
    fetcher,
  );
  const { data: customerData } = useSWR(
    type === 'WxCustomer' && namespaces[2] && url(`/api/wxkf/externalUser/${namespaces[2]}`),
    fetcher,
  );

  let icon = null;
  switch (type) {
    case 'Wxkf':
      icon = (<Avatar className="mr-2 bg-green-600" size='small' src={<WechatOutlined style={{ verticalAlign: '0' }} />}></Avatar>);
      break;
    case 'Rasa':
      icon = (<Avatar className="mr-2 bg-purple-600" size='small' src={<RobotOutlined style={{ verticalAlign: '0' }} />}></Avatar>);
      break;
    case 'WxCustomer':
      icon = (<Avatar className="mr-2 bg-green-600" size='small' src={<WechatOutlined style={{ verticalAlign: '0' }} />}></Avatar>);
      break;
    default:
      icon = (<Avatar className="mr-2" size='small'>{type.slice(0, 1)}</Avatar>);
  }

  let content = null;
  switch (type) {
    case 'Wxkf':
      const wxkf = wxkfData?.find((item) => item.open_kfid === namespaces[1]);
      content = (<p>{wxkf && (<Avatar className="mr-2" size='small' src={wxkf.avatar} />)}{wxkf?.name || name}</p>)
      break;
    case 'WxCustomer':
      content = (<p>{customerData && (<Avatar className="mr-2" size='small' src={customerData.avatar} />)}{customerData?.nickname || namespaces[2]}</p>)
      break;
    default:
      content = (<p>{namespaces[0]}</p>)
  }

  return (
    <div className={`flex flex-row align-middle ${className || ''}`}>
      {icon}
      {content}
    </div>
  );
}
