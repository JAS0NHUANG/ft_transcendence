import { useState } from "react";
import JBRegular from "../assets/fonts/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Regular.woff2";
import Button from "../components/auth_components/styles/Button.styled";
import Input from "../components/auth_components/styles/Input.styled";
import { ModalContainer, PopUpWrapper } from "../components/auth_components/styles/Modal2FA.styled";
import { useNavigate } from "react-router";
import axios, { AxiosError } from "axios";
import styled from "styled-components";
import Cookies from 'js-cookie';

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
const Verify2FA = () => {
	const [inputValue, setInputValue] = useState("");
  	const [errorResponse, setErrorResponse] = useState("");

	const navigate = useNavigate();

	const handleCancelClick = () => {
		navigate("/auth");
	}

	const handleConfirmClick = async () => {

	const updateDTO = {
		code: inputValue,
    nonce: Cookies.get('nonce')
	};

	try {
		const response = await axios.post(
		`${import.meta.env.VITE_BACKEND_URL}/auth/2fa-verify`,
		updateDTO,
		{ withCredentials: true }
		);
		console.log(response);
    	navigate("/landing");
	} catch (error) {
			handleUpdateError(error as AxiosError);
	}
	};

	const handleUpdateError = (error: AxiosError) => {
		console.log(error.response)
		if (error.response) {
			setErrorResponse("Wrong code. Please try again!");
			setInputValue("");
		};
	};

  return (
    <PageContainer>
		<ModalContainer style={{}} >
			<PopUpWrapper>
				<h2>2FA Authentification</h2>
				<p>Please enter your code</p>
				<Input
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)} // Update inputValue
				placeholder="Enter code here"
				/>
				{errorResponse && (
				<div style={{ color: "red", fontSize: "12px" }}>{errorResponse}</div>)}
				<div>
					<Button type="button" onClick={handleCancelClick}>Cancel</Button>
					<Button type="submit" onClick={handleConfirmClick}>Confirm</Button>
				</div>
			</PopUpWrapper>
		</ModalContainer>
    </PageContainer>
  );
};

export default Verify2FA;
