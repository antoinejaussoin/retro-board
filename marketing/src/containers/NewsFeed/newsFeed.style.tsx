import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

export const Section = styled.section`
  padding-top: 70px;
  padding-bottom: 60px;
  @media screen and (max-width: 480px) {
    padding-bottom: 45px;
  }
`;

export const SectionHeading = styled.div`
  text-align: center;
  margin-bottom: 70px;
  @media screen and (max-width: 768px) {
    margin-bottom: 40px;
  }
  h2 {
    font-weight: 700;
    font-size: 26px;
    line-height: 1.5;
    letter-spacing: -0.2px;
    @media screen and (max-width: 768px) {
      font-size: 26px;
    }
    @media screen and (max-width: 480px) {
      font-size: 24px;
    }
  }
`;

export const Grid = styled.div`
  gap: 30px;
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(3, 415px);
  @media screen and (max-width: 1280px) {
    gap: 30px;
    grid-template-columns: repeat(3, 1fr);
  }
  @media screen and (max-width: 1024px) {
    gap: 15px;
  }
  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-gap: 40px 0;
  }
`;

export const Article = styled.article`
  transition: all 0.2s ease 0s;
  :hover {
    transform: translateY(-7px);
  }
  img {
    border-radius: 12px;
  }
  p {
    font-family: Inter, sans-serif;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    margin: 20px 0 0;
  }
  h4 {
    font-weight: 700;
    font-size: 18px;
    line-height: 1.68;
    margin: 8px 0 0;
    @media screen and (max-width: 1024px) {
      font-size: 17px;
    }
    @media screen and (max-width: 768px) {
      font-size: 16px;
    }
  }
  a {
    color: ${themeGet('colors.linkColor')};
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    letter-spacing: -0.1px;
    margin-top: 10px;
    @media screen and (max-width: 480px) {
      font-size: 14px;
    }
    i {
      line-height: 1;
      margin-left: 5px;
      transform: translateX(0px);
      transition: 0.3s ease 0s;
    }
    &:hover i {
      transform: translateX(3px);
    }
  }
`;
