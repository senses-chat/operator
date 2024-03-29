import { ReactNode } from 'react';
import { Button } from 'antd';

export function handleSessionMessageContent(msg): ReactNode | string {
  switch (msg.content.type) {
    case 'text':
      if (['/greet', '/bye'].includes(msg.content.text)) return msg.content.text;
      if (!msg.content.text && msg.content.metadata.servicer_userid) return '/redirect';
      return <p className="mb-0">{msg.content.text}</p>;
    case 'file':
      return <p className="mb-0">{`file: ${msg.content.file_url}`}</p>;
    case 'image':
      return <p className="mb-0">{`image: ${msg.content.image_url}`}</p>;
    case 'text_with_buttons':
      return (
        <>
          <p className="mb-0">{msg.content.text}</p>
          <div className="my-1">
          {msg.content.buttons.map((button, index) => (
            <Button key={index} href={button.payload} className="mr-2">
              {button.title}
            </Button>
          ))}
          </div>
          <p className="mb-0">{msg.content.textAfterButtons}</p>
        </>
      );
  }
}

export function handleWxkfIncomeMessageContent(msg): ReactNode | string {
  switch (msg.msgtype) {
    case 'text':
      if (['/greet', '/bye'].includes(msg.text.content)) return msg.text.content;
      if (!msg.text.content && msg.metadata.servicer_userid) return '/redirect';
      return <p className="mb-0">{msg.text.content}</p>;
    case 'image':
      return <p className="mb-0">{`image: ${msg.image.media_id}`}</p>;
    case 'voice':
      return <p className="mb-0">{`voice: ${msg.voice.media_id}`}</p>;
    case 'video':
      return <p className="mb-0">{`video: ${msg.video.media_id}`}</p>;
    case 'file':
      return <p className="mb-0">{`file: ${msg.file.media_id}`}</p>;
    case 'location':
      return (
        <p className="mb-0">{`location: ${msg.location.name} ${msg.location.address}`}</p>
      );
    case 'event':
      return msg.event.event_type;
  }
}

export function getCorpId() {
  return 'wwb3e9f81ebbe83dbc';
}
