import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const Section = styled.section`
  padding-bottom: 60px;
  @media (min-width: 769px) and (max-width: 1024px) {
    padding-top: 40px;
  }
  @media (max-width: 1024px) {
    padding-bottom: 50px;
  }
  @media (max-width: 768px) {
    padding-top: 40px;
  }
  @media (max-width: 480px) {
    padding-top: 40px;
    padding-bottom: 40px;
  }
`;

export const Title = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  p {
    font-weight: 500;
    font-size: 17px;
    margin-bottom: 0;
    color: ${themeGet('colors.textColor')};
    @media (max-width: 480px) {
      text-align: center;
    }
  }
`;

export const Figure = styled.figure`
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
`;

export const SliderWrapper = styled.div`
  margin-top: 45px;
  max-width: 1050px;
  margin-left: auto;
  margin-right: auto;
  .slider {
    display: flex;
    justify-content: space-between;
  }
  figure {
    img {
      opacity: 0.7;
    }
  }
  .slick-slide > div {
    display: flex;
    min-height: 35px;
    align-items: center;
    img {
      margin: 0 auto;
    }
  }
  .slick-track {
    align-items: center;
    justify-content: center;
    display: flex;
    gap: 20px;
  }
  .slick-dots {
    display: flex !important;
    align-items: center;
    justify-content: center;
    margin-top: 30px;
    button {
      background-color: rgba(0, 0, 0, 0.2);
      border: 0;
      border-radius: 20px;
      height: 10px;
      width: 10px;
      margin: 0 5px;
      padding: 0;
      text-indent: -9999em;
    }
    .slick-active button {
      background-color: rgba(0, 0, 0, 0.6);
    }
  }
`;

export default Section;
