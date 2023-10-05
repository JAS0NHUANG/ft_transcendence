import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router";
import Input from "./styles/Input.styled";
import { ModalContainer, PopUpWrapper } from "./styles/Modal2FA.styled";
import Button from "./styles/Button.styled";

interface Modal2FAProps {
	onCancel: () => void;
	nonce: string;
  }
  
  export const Modal2FA: React.FC<Modal2FAProps> = ({ onCancel, nonce }) => {
	const [inputValue, setInputValue] = useState("");
  	const [errorResponse, setErrorResponse] = useState("");

	const navigate = useNavigate();

	const handleConfirmClick = async () => {

	console.log("inputValue: " + inputValue);
	console.log("nonceValue: " + nonce);
	const updateDTO = {
		code: inputValue,
		nonce: nonce
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
		<ModalContainer>
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
					<Button type="button" onClick={onCancel}>Cancel</Button>
					<Button type="submit" onClick={handleConfirmClick}>Confirm</Button>
				</div>
			</PopUpWrapper>
		</ModalContainer>
	);
};
