import styled from '@emotion/styled';
import { colors } from '@mui/material';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
  message: string | ReactNode;
  own?: boolean;
};

export default function ChatMessage({
  message,
  own = false,
}: ChatMessageProps) {
  return (
    <MessageContainer own={own}>
      <MessageContent own={own}>
        {typeof message === 'string' ? (
          <ReactMarkdown>{message}</ReactMarkdown>
        ) : (
          message
        )}
      </MessageContent>
    </MessageContainer>
  );
}

const MessageContainer = styled.div<{ own: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.own ? 'flex-end' : 'flex-start')};
  padding-right: ${(props) => (props.own ? '0' : '50px')};
  padding-left: ${(props) => (props.own ? '50px' : '0')};
  margin-top: 20px;
`;

const MessageContent = styled.div<{ own: boolean }>`
  text-align: left;
  padding: 15px;
  border-radius: 10px;
  background-color: ${(props) => (props.own ? colors.blue[400] : '#f0f0f0')};
  color: ${(props) => (props.own ? 'white' : 'black')};
  line-height: 1.4rem;
  p,
  ul,
  ol,
  pre,
  blockquote {
    margin: 0 0 0.6em;
  }
  p:last-child,
  ul:last-child,
  ol:last-child,
  pre:last-child,
  blockquote:last-child {
    margin-bottom: 0;
  }
  ul,
  ol {
    padding-inline-start: 1.2em;
  }
  a {
    color: inherit;
  }
  code {
    font-size: 0.9em;
  }
  pre {
    overflow-x: auto;
    padding: 8px;
    border-radius: 6px;
    background: ${(props) =>
      props.own ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.06)'};
  }
`;
