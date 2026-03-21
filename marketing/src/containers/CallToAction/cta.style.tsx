import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const Section = styled.section`
  background-color: ${themeGet('colors.sectionBackgroundColor')};
  padding-top: 60px;
  padding-bottom: 60px;
  position: relative;
  @media (max-width: 1024px) {
    padding-top: 40px;
    padding-bottom: 60px;
  }
  .bubble-1,
  .bubble-2 {
    position: absolute;
  }
  .bubble-1 {
    left: 0;
    bottom: -6px;
    max-width: 60px;
    @media (min-width: 768px) {
      bottom: -10px;
      max-width: 100px;
    }
    @media (min-width: 1280px) {
      max-width: 130px;
    }
  }
  .bubble-2 {
    right: 0;
    top: -10px;
    max-width: 60px;
    @media (min-width: 768px) {
      top: -20px;
      max-width: 100px;
    }
    @media (min-width: 1280px) {
      max-width: 130px;
    }
  }
`;

export const Content = styled.div`
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
  h2 {
    color: ${themeGet('colors.white')};
    font-weight: 800;
    font-size: 36px;
    line-height: 1.53;
    letter-spacing: -0.5px;
    max-width: 755px;
    margin: 0 auto 15px;
    @media (max-width: 1024px) {
      font-size: 32px;
    }
    @media (max-width: 768px) {
      font-size: 28px;
    }
    @media (max-width: 480px) {
      font-size: 24px;
      margin-bottom: 20px;
    }
  }
  p {
    color: ${themeGet('colors.textColorLight')};
    font-weight: 500;
    font-size: 17px;
    line-height: 2.06;
    max-width: 575px;
    margin: 0 auto 55px;
    @media (min-width: 1025px) and (max-width: 1280px) {
      margin-bottom: 35px;
    }
    @media (max-width: 768px) {
      margin-bottom: 30px;
    }
    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 25px;
    }
  }
  span {
    display: block;
    a {
      color: ${themeGet('colors.textColorLight')};
      font-size: 14px;
      font-weight: 700;
      line-height: 2.43;
      margin-top: 25px;
      @media (max-width: 480px) {
        margin-top: 15px;
      }
    }
  }
  button {
    border-radius: 8px;
  }
`;

export default Section;
