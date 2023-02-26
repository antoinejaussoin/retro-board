import styled from 'styled-components';
import Slider from 'react-slick';
import { rgba } from 'polished';
import { themeGet } from '@styled-system/theme-get';

const Section = styled.section`
  padding-top: 60px;
  padding-bottom: 120px;
  @media (max-width: 768px) {
    padding-top: 40px;
    padding-bottom: 60px;
  }
  @media (max-width: 480px) {
    padding-bottom: 40px;
  }
`;
export default Section;

export const SectionHeading = styled.div`
  text-align: center;
  margin-bottom: 80px;
  @media only screen and (max-width: 768px) {
    margin-bottom: 40px;
  }
  h2 {
    font-weight: 800;
    line-height: 36px;
    letter-spacing: -0.5px;
    @media (min-width: 768px) {
      font-size: 26px;
    }
    @media (max-width: 480px) {
      font-size: 24px;
    }
  }
`;

export const ReactSlick = styled(Slider)`
  .slick-slide > div {
    margin: 0 12px;
  }
  .slick-dots {
    display: flex !important;
    justify-content: center;
    margin-top: 40px;
    li {
      + li {
        margin-left: 7px;
      }
      button {
        background-color: ${rgba('#000', 0.2)};
        border: 0;
        border-radius: 50px;
        cursor: pointer;
        display: block;
        text-indent: -9999em;
        height: 9px;
        width: 12px;
        transition: all 0.3s ease-in-out 0s;
      }
    }
    .slick-active {
      button {
        background-color: ${themeGet('colors.black')};
        width: 18px;
      }
    }
  }
`;

export const Item = styled.div`
  background-color: #f6f7f9;
  border-radius: 15px;
  padding: 40px 35px 45px;
  font-family: 'Inter', sans-serif;
  min-height: 432px;
  display: flex !important;
  flex-direction: column;
  @media only screen and (max-width: 480px) {
    padding: 30px 25px 35px;
  }
  figure {
    margin: 0 0 35px;
    @media only screen and (max-width: 480px) {
      margin-bottom: 20px;
    }
  }
  blockquote {
    color: ${themeGet('colors.headingColor')};
    font-size: 18px;
    line-height: 1.94;
    margin: 0 0 30px;
    @media only screen and (max-width: 768px) {
      font-size: 16px;
    }
    @media only screen and (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 15px;
    }
  }
  h4 {
    color: ${themeGet('colors.headingColor')};
    margin-bottom: 12px;
  }
  p {
    color: ${themeGet('colors.textColor')};
    line-height: 19px;
    margin-bottom: 0;
  }
`;

export const AuthorInfo = styled.div`
  margin-top: auto;
`;
