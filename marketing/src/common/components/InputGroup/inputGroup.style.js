import styled from 'styled-components';

const ComponentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const Input = styled.input`
  width: calc(100% - 180px);
  height: 65px;
  font-size: 20px;
  font-weight: 600;
  padding: 0 20px;
  border: 2px solid #f2f2f2;
  border-right-width: 1px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  color: #294859;
  @media only screen and (max-width: 1440px) {
    font-size: 16px;
    height: 60px;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
  }

  &::placeholder {
    color: #616970;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  width: 180px;
`;

export const CurrentOption = styled.div`
  cursor: pointer;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border: 2px solid #f2f2f2;
  border-left-width: 1px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  @media only screen and (max-width: 1440px) {
    height: 60px;
  }

  .text {
    color: #294859;
    margin-right: 20px;
    font-size: 20px;
    font-weight: 600;
    @media only screen and (max-width: 1440px) {
      font-size: 16px;
      margin-right: 15px;
    }
  }
`;

export const Dropdown = styled.ul`
  position: absolute;
  left: 0;
  top: 65px;
  width: 100%;
  border-radius: 10px;
  opacity: 0;
  visibility: hidden;
  background-color: #ffffff;
  box-shadow: 0 3px 9px -2px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 2;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  li {
    cursor: pointer;
    font-size: 18px;
    padding: 15px 20px;
    color: #616970;
    border-bottom: 2px solid #f2f2f2;
    transition: all 0.3s ease;
    @media only screen and (max-width: 1440px) {
      font-size: 16px;
    }

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      color: #294859;
      background-color: #f2f2f2;
    }

    &.selected {
      color: #294859;
      font-weight: 600;
    }
  }
`;

export default ComponentWrapper;
