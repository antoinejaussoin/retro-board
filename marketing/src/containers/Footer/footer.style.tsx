import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import { rgba } from 'polished';

export const Section = styled.footer`
  padding-top: 50px;
`;

export const Grid = styled.div`
  display: flex;
  gap: 30px;
  > * {
    flex: 1;
  }
  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
  @media screen and (max-width: 480px) {
    gap: 20px;
  }
`;

export const AboutUs = styled.div`
  @media screen and (min-width: 1280px) {
    width: 290px;
    margin-right: 80px;
  }
  @media screen and (min-width: 1024px) {
    width: 240px;
    margin-right: 30px;
  }
  @media screen and (max-width: 480px) {
    grid-column: 1/3;
  }
  img {
    max-width: 126px;
    margin-bottom: 25px;
  }
  p {
    color: ${themeGet('colors.textColor')};
    font-family: Inter, sans-serif;
    font-size: 15px;
    line-height: 2;
    letter-spacing: -0.002em;
    margin-bottom: 0;
  }
`;

export const FooterWidget = styled.div`
  h4 {
    font-weight: 700;
    font-size: 17px;
    line-height: 1.76;
    margin: 0 0 25px;
    @media screen and (max-width: 768px) {
      margin-bottom: 15px;
    }
    @media screen and (max-width: 480px) {
      font-size: 16px;
    }
  }

  &:last-child {
    margin-right: 0;
  }
  .widgetListItem {
    a {
      color: ${themeGet('colors.textColor')};
      font-size: 14px;
      line-height: 2.5;
      font-weight: 500;
      &:hover {
        color: #02073e;
      }
    }
  }
`;

export const ContactInfo = styled.div`
  @media screen and (max-width: 768px) {
    grid-column: 2/4;
  }
  @media screen and (max-width: 480px) {
    grid-column: 1/3;
  }
  h4 {
    font-weight: 700;
    font-size: 17px;
    line-height: 1.76;
    margin: 0 0 25px;
  }
`;

export const InfoItem = styled.div`
  color: ${themeGet('colors.textColor')};
  display: flex;
  align-items: flex-start;
  font-family: Inter, sans-serif;
  font-size: 15px;
  line-height: 28px;
  letter-spacing: -0.002em;
  i {
    color: ${rgba('#000', 0.35)};
    margin-right: 12px;
  }
  .phone-icon {
    margin-top: 6px;
  }
  .phone-number {
    margin-bottom: 0;
  }
`;

export const FooterBottom = styled.div`
  border-top: 1px solid ${themeGet('colors.borderColor')};
  color: ${themeGet('colors.headingColor')};
  font-family: Inter, sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 0 45px;
  margin-top: 60px;
  @media screen and (max-width: 1024px) {
    margin-top: 40px;
  }
  @media screen and (max-width: 768px) {
    gap: 25px;
    display: grid;
    text-align: center;
    justify-content: center;
  }
  p {
    margin-bottom: 0;
    @media screen and (max-width: 480px) {
      line-height: 1.8;
    }
  }
`;

export const FooterNav = styled.ul`
  display: flex;
  justify-content: center;
  li {
    + li {
      margin-left: 30px;
      @media screen and (max-width: 480px) {
        margin-left: 20px;
      }
    }
    a {
      color: ${themeGet('colors.headingColor')};
      :hover {
        color: ${themeGet('colors.black')};
      }
    }
  }
`;

export const SocialLinks = styled.div`
  align-items: center;
  display: flex;
  @media screen and (max-width: 768px) {
    justify-content: center;
  }
  ul {
    display: flex;
    align-items: center;
    li {
      display: inline-flex;
      margin-left: 15px;
      a {
        display: inline-flex;
      }
    }
  }
`;
