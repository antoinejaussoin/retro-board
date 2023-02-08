import styled, { css } from 'styled-components';

type ContainerProps = {
  fullWidth?: boolean;
  noGutter?: boolean;
  mobileGutter?: boolean;
  width?: string;
};

const ContainerWrapper = styled.div<ContainerProps>`
  margin-left: auto;
  margin-right: auto;
  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
      max-width: none !important;
    `};
  ${(props) =>
    (props.noGutter &&
      css`
        padding-left: 0;
        padding-right: 0;
      `) ||
    css`
      padding-left: 30px;
      padding-right: 30px;
    `};
  @media (min-width: 768px) {
    max-width: 750px;
    width: 100%;
  }
  @media (min-width: 992px) {
    max-width: 970px;
    width: 100%;
  }
  @media (min-width: 1220px) {
    max-width: ${(props) => props.width || '1170px'};
    width: 100%;
  }
  @media (min-width: 1400px) {
    max-width: ${(props) => props.width || '1360px'};
    width: 100%;
  }
  @media (max-width: 768px) {
    ${(props) =>
      props.mobileGutter &&
      css`
        padding-left: 30px;
        padding-right: 30px;
      `};
  }
`;

export default ContainerWrapper;
