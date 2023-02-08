import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import Collapse from 'rc-collapse';

const Section = styled.section`
  padding: 80px 0;
  @media (max-width: 1280px) {
    padding-top: 50px;
  }
  @media (max-width: 1024px) {
    padding-top: 50px;
    padding-bottom: 70px;
  }
  @media (max-width: 768px) {
    padding-top: 40px;
    padding-bottom: 60px;
  }
  .container {
    max-width: 750px;
  }
`;

export const SectionHeading = styled.div`
  text-align: center;
  margin-bottom: 50px;
  h2 {
    margin-bottom: 0;
    @media (min-width: 1024px) {
      font-size: 26px;
    }
    @media (max-width: 480px) {
      font-size: 24px;
    }
  }
`;

export const RcCollapse = styled(Collapse)`
  background-color: transparent;
  border: 0;
  display: grid;
  gap: 12px;
  .rc-collapse-item {
    border: 0;
    box-shadow: 0px 2px 6px rgba(187, 199, 206, 0.25);
    border-radius: 6px;
    padding: 25px;
    .rc-collapse-header {
      display: flex;
      cursor: pointer;
      justify-content: space-between;
      padding: 0;
      z-index: 100;
      position: relative;
      .icon {
        position: relative;
        width: 15px;
        height: 15px;
        i {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .plus {
        color: rgba(0, 0, 0, 0.4);
      }
      .minus {
        opacity: 0;
      }
    }
    h4 {
      margin-bottom: 0;
    }
    .rc-collapse-content {
      padding: 0 25px;
      @media (max-width: 480px) {
        padding: 0;
      }
    }
    .rc-collapse-content-box {
      padding: 15px 0 0;
      font-weight: 500;
      font-size: 15px;
      line-height: 1.87;
      margin: 0;
    }
  }
  .rc-collapse-item-active {
    .rc-collapse-header {
      .minus {
        color: ${themeGet('colors.black')};
        opacity: 1;
      }
      .plus {
        opacity: 0;
      }
    }
  }
`;

export default Section;
