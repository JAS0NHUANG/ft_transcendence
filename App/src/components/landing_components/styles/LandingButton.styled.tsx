import React from "react";
import { styled } from "styled-components";

export type LandingProps = {
  children?: React.ReactNode;
  onClick: () => void;
  navBar: boolean;
};

const StyledLandingButton = styled.button<{}>`
  margin-top: 15px;
  margin-left: 15px;
  margin-bottom: 15px;
  width: 90px;
  height: 90px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  border: 5px solid #e3dcdc;
  background: rgba(217, 217, 217, 0);
  justify-content: center;
  align-items: center;

  h1 {
    color: #fff;
    text-align: center;
    font-family: "JetBrains Mono", monospace;
    font-size: 35px;
    font-style: normal;
    /* font-weight: 500px; */
    line-height: 70px;
    letter-spacing: 0.9px;
    text-decoration: none;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1:hover {
    color: #000;
  }

  &:hover {
    background-color: #fff;
  }
`;

const LandingButton: React.FC<LandingProps> = ({ onClick, children }) => {
  return (
    <StyledLandingButton onClick={onClick}>{children}</StyledLandingButton>
  );
};

export default LandingButton;
