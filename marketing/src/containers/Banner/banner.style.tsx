import { rgba } from 'polished';
import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const Section = styled.section`
  position: relative;
  z-index: 0;
  @media (min-width: 768px) and (max-width: 1280px) {
    background-size: contain;
  }
`;

export const BannerContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 30px;
  @media (min-width: 1025px) {
    min-height: min(calc(100vh - 260px), 900px);
  }

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
  }
`;

export const BannerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 1024px) {
    margin-top: 100px;
  }
  @media (max-width: 400px) {
    margin-top: 10px;
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

export const Buttons = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;

  @media only screen and (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const Subscribe = styled.div`
  display: flex;
  justify-content: center;
  max-width: 540px;

  @media screen and (max-width: 1366px) {
    max-width: 80%;
  }
  @media only screen and (max-width: 768px) {
    max-width: 80%;
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
      min-height: 45px;
      width: 100%;
    }
  }
`;

export const Figure = styled.figure`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;

  @media (max-width: 1024px) {
    aspect-ratio: 4 / 3;
  }

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
`;

export default Section;
