import styled from 'styled-components';

type Props = {
  content: string;
};

const PostBody = ({ content }: Props) => {
  return (
    <Container
      // className={markdownStyles['markdown']}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const Container = styled.div`
  margin: 30px;
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px;
`;

export default PostBody;
