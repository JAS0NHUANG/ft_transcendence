import React, { useState } from "react";
import LoginForm from "../components/auth_components/LoginForm";
import styled from "styled-components";
import JBRegular from "../assets/fonts/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Regular.woff2";
import { createPortal } from "react-dom";
import { Modal2FA } from "../components/auth_components/Modal2FA";

type PageContainerProps = {
  children?: React.ReactNode;
};

const PageContainer = styled.div<PageContainerProps>`
  @font-face {
    font-family: "JetBrains Mono";
    src: url(${JBRegular}) format("woff2");
    font-weight: normal;
    font-style: normal;
  }
`;

const Authentification = () => {
  const [modal2FAOpen, setModal2FAOpen] = useState(false);
  const [nonce2FA, setNonce2FA] = useState("");

  const handleModal2FA = (nonce: string) => {
    setModal2FAOpen(true);
    setNonce2FA(nonce);
  }

  const handleButtonClick = () => {
    setModal2FAOpen(false);
  };

  return (
    <PageContainer>
        <LoginForm openModal2FA={handleModal2FA} />
        {modal2FAOpen &&
          createPortal(
          <Modal2FA onCancel={handleButtonClick} nonce={nonce2FA} />,
          document.body
        )}
    </PageContainer>
  );
};

export default Authentification;