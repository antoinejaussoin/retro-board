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

const Container = styled.div``;

export default PostBody;
