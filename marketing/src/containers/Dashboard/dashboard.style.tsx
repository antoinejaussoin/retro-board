import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import { Tabs } from 'react-tabs';
import pattern1 from '@/common/assets/image/webAppCreative/pattern1.png';
import pattern2 from '@/common/assets/image/webAppCreative/pattern2.png';

const Section = styled.section`
  background-color: #fff;
  padding-top: 100px;
  padding-bottom: 100px;
  position: relative;
  z-index: 20;
  @media (max-width: 1280px) {
    padding-top: 60px;
    padding-bottom: 60px;
  }
  @media (max-width: 1024px) {
    padding-top: 60px;
    padding-bottom: 60px;
  }
  @media (max-width: 768px) {
    padding-top: 40px;
    padding-bottom: 40px;
  }
`;
export default Section;

export const SectionHeading = styled.div`
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  margin-bottom: 40px;
  h2 {
    font-weight: 800;
    font-size: 26px;
    line-height: 49px;
    letter-spacing: -0.2px;
    @media only screen and (max-width: 480px) {
      font-size: 24px;
      line-height: 1.5;
    }
  }
  p {
    color: ${themeGet('colors.textColor')};
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    line-height: 2.22;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    @media only screen and (max-width: 1024px) {
      max-width: 700px;
    }
    @media only screen and (max-width: 768px) {
      font-size: 16px;
      line-height: 2;
      max-width: 550px;
    }
  }
`;

export const Figure = styled.div`
  aspect-ratio: 16/9;
  height: calc(100vh - 400px);
  margin: 0 auto;
  img {
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
`;

export const Description = styled.div`
  text-align: center;
  color: ${themeGet('colors.textColor')};
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 20px;
  margin-top: 40px;
  margin-left: auto;
  margin-right: auto;
  @media only screen and (max-width: 1024px) {
    max-width: 700px;
  }
  @media only screen and (max-width: 768px) {
    font-size: 16px;
    line-height: 2;
    max-width: 550px;
  }
`;

export const ReactTabs = styled(Tabs)`
  > nav {
    text-align: center;
    margin-bottom: 15px;
  }
  .react-tabs__tab-list {
    background-color: #f4f5f9;
    padding: 6px;
    display: inline-flex;
    border-radius: 70px;
    justify-content: center;
    @media only screen and (max-width: 1280px) {
      margin-bottom: 30px;
    }
    @media only screen and (max-width: 768px) {
      margin-bottom: 45px;
    }
    @media only screen and (max-width: 480px) {
      display: flex;
      border-radius: 6px;
      padding: 12px;
      max-width: 100%;
      overflow-x: scroll;
      justify-content: flex-start;

      // scrollbar
      ::-webkit-scrollbar {
        -webkit-appearance: none;
        -webkit-overflow-scrolling: auto;
        height: 8px;
        width: 8px;
        border-radius: 10px;
        background: #e3e3e3;
      }
      ::-webkit-scrollbar-thumb:horizontal {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        border-radius: 4px;
      }
    }
  }
  .react-tabs__tab {
    color: ${themeGet('colors.headingColor')};
    cursor: pointer;
    font-weight: 700;
    font-size: 18px;
    line-height: 25px;
    padding: 14px 18px;
    transition: all 0.3s ease-in-out 0s;
    @media only screen and (max-width: 480px) {
      font-size: 16px;
      padding: 10px;
    }
    @media only screen and (min-width: 768px) {
      font-size: 16px;
      + .react-tabs__tab {
        margin-left: 12px;
      }
    }
  }
  .react-tabs__tab--selected {
    background-color: #fff;
    border-radius: 70px;
    box-shadow: 0px 10px 30px rgba(80, 99, 126, 0.1);
    @media only screen and (max-width: 480px) {
      border-radius: 6px;
    }
  }
  .react-tabs__tab-panel {
    figure {
      margin: 0;
      position: relative;
      animation-duration: 400ms;
      img {
        @media (min-width: 1280px) and (max-width: 1140px) {
          max-width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
      }
      ::before,
      ::after {
        content: '';
        position: absolute;
        z-index: -1;
      }
      ::before {
        background: transparent url(${pattern1?.src}) no-repeat;
        width: 223px;
        height: 202px;
        left: 0;
        top: -5px;
        @media (min-width: 1025px) and (max-width: 1440px) {
          left: 80px;
          top: -25px;
        }
        @media (max-width: 1024px) {
          margin-top: -15px;
        }
        @media (max-width: 768px) {
          width: 150px;
          height: 150px;
          background-size: contain;
          top: -10px;
        }
        @media (max-width: 480px) {
          width: 100px;
          height: 100px;
          background-size: contain;
          top: -10px;
        }
      }
      ::after {
        background: transparent url(${pattern2?.src}) no-repeat;
        height: 223px;
        width: 202px;
        right: -30px;
        bottom: -35px;
        @media (min-width: 1025px) and (max-width: 1440px) {
          right: 95px;
          bottom: -55px;
        }
        @media (max-width: 768px) {
          width: 150px;
          height: 150px;
          background-size: contain;
          bottom: -10px;
        }
        @media (max-width: 480px) {
          width: 100px;
          height: 100px;
          background-size: contain;
          bottom: -10px;
        }
      }
    }
  }
`;
