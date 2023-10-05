import styled from "styled-components";
import React from "react";

export type ConfirmButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
};

export const StyledConfirmButton = styled.button<{}>`
  height: 23px;
  padding-left: 13px;
  padding-right: 14px;
  margin-top: auto; /* Align the button at the bottom */
  margin-right: 10px; /* Add margin on the right side */
  margin-left: 10px; /* Add margin on the left side */
  border: 1px solid #fff;
  background: #fff;
  box-shadow: -3px -2px 1px 0px rgba(0, 0, 0, 0.98) inset;
  color: #000;
  font-family: "JetBrains Mono", monospace;
  font-weight: normal;
  font-style: normal;
  font-size: 12px;
`;

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  type,
  onClick,
  children,
}) => {
  return (
    <StyledConfirmButton type={type} onClick={onClick}>
      {children}
    </StyledConfirmButton>
  );
};

export default ConfirmButton;
