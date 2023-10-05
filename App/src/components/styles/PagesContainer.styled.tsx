import React from "react";
import styled from "styled-components";

export type PagesContProps = {
  children?: React.ReactNode;
  type?: "settings" | "other";
};

const PageContainerStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopUpPage = styled.div`
  width: 960px;
  height: 642px;
  border: 1px solid #fff;
  background: #000;
  box-shadow: 1px 3px 1px 0px #fff;
  font-family: "JetBrains Mono", monospace;
  z-index: 2;

  overflow: auto; /* Add scrolling when content overflows */

  @media screen and (max-width: 1480px) {
    width: 50%;
  }

  @media screen and (max-width: 1000px) {
    z-index: 0;
  }
`;

const PageContainer: React.FC<PagesContProps> = ({ children, type }) => {
  return (
    <PageContainerStyled>
      {type === "other" ? <PopUpPage>{children}</PopUpPage> : children}
    </PageContainerStyled>
  );
};

export default PageContainer;
