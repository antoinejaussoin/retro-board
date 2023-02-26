import { rgba } from 'polished';
import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const Section = styled.section`
  position: relative;
  z-index: 0;
  @media (min-width: 768px) and (max-width: 1280px) {
    background-size: contain;
  }
  @media (min-width: 1280px) {
    margin-bottom: 50px;
  }
`;

export const BannerContentWrapper = styled.div`
  @media (min-width: 1280px) {
    min-height: 100vh;
  }
`;

export const BannerContent = styled.div`
  padding-top: 210px;
  max-width: 870px;
  margin: 0 auto;
  text-align: center;
  @media (max-width: 1024px) {
    max-width: 660px;
    padding-top: 170px;
  }
  @media (max-width: 768px) {
    max-width: 550px;
    padding-top: 150px;
  }
  @media (max-width: 480px) {
    padding-top: 100px;
  }
  h2 {
    color: ${themeGet('colors.headingColor')};
    font-weight: 700;
    font-size: 54px;
    line-height: 1.3;
    text-align: center;
    letter-spacing: -1px;
    @media (max-width: 1024px) {
      font-size: 40px;
    }
    @media (max-width: 768px) {
      font-size: 32px;
    }
    @media (max-width: 480px) {
      font-size: 24px;
    }
  }
  p {
    font-weight: 500;
    font-size: 18px;
    line-height: 2.11;
    color: ${themeGet('colors.textColor')};
    max-width: 600px;
    margin: 0 auto;

    @media (max-width: 480px) {
      font-size: 16px;
      line-height: 1.6;
    }
  }
`;

export const Subscribe = styled.div`
  display: flex;
  justify-content: center;
  max-width: 540px;
  margin: 28px auto 0;
  @media screen and (max-width: 1366px) {
    max-width: 80%;
  }
  @media only screen and (max-width: 768px) {
    max-width: 80%;
    margin: 30px auto 0;
  }
  @media only screen and (max-width: 480px) {
    max-width: initial;
    display: block;
  }
  .reusecore__input {
    width: 100%;
  }
  .field-wrapper {
    background-color: #f1f4f6;
    border-radius: 8px;
    margin-right: 15px;
    flex-direction: row-reverse;
    @media only screen and (max-width: 480px) {
      margin-right: 0;
    }
    input {
      background-color: #f1f4f6;
      border: 0;
      border-radius: 8px;
      font-size: 16px;
      min-height: 60px;
      padding: 0 24px;
      &::placeholder {
        color: ${rgba('#02073E', 0.4)};
        opacity: 1; /* Firefox */
      }
      @media only screen and (max-width: 1280px) {
        min-height: 50px;
      }
    }
  }
  .icon-left {
    .field-wrapper {
      input {
        padding-left: 12px;
      }
      > .input-icon {
        position: static;
        height: auto;
        padding: 0;
        margin-left: 25px;
        min-width: 25px;
        width: auto;
      }
    }
  }
  button {
    border-radius: 8px;
    white-space: nowrap;
    padding: 0 30px;
    min-height: 60px;
    @media only screen and (max-width: 1200px) {
      min-height: 50px;
    }
    @media only screen and (max-width: 480px) {
      margin-top: 15px;
      min-height: 45px;
      width: 100%;
    }
  }
`;

export const Figure = styled.figure`
  margin: 30px 0 0;
  display: flex;
  aspect-ratio: 4 / 3;

  img.background {
    z-index: 0;
    position: absolute;
  }

  img {
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: contain;
    @media (min-width: 1280px) {
      margin-left: auto;
      margin-right: auto;
    }
  }
  @media (min-width: 768px) {
    margin-top: 80px;
  }
`;

export default Section;
