import React, { useEffect, useState } from "react";
import { ModalContainer, PopUpWrapper } from "./styles/NewChannelModal.styled";
import ConfirmButton from "../settings_components/styles/ConfirmButton.styled";
import { Socket } from "socket.io-client";

interface NewChannelModalProps {
	onCancel: () => void;
	socket_chat: Socket
}
  
export const NewChannelModal: React.FC<NewChannelModalProps> = ({ onCancel, socket_chat }) => {
	const [channelName, setChannelName] = useState("");
	const [password, setPassword] = useState("");
  	const [errorResponse, setErrorResponse] = useState("");

	useEffect(() => {
	const handleCreateChannelSuccess = () => {
		onCancel();
		window.location.reload();
	};

	const handleCreateChannelError = (error: any) => {
		console.log("error when create channel");
		setErrorResponse(error.message); // Assuming error.message contains the error message
	};

	socket_chat.on("createChannelSuccess", handleCreateChannelSuccess);
	socket_chat.on("createChannelError", handleCreateChannelError);

	// Clean up event listeners when the component is unmounted
	return () => {
		socket_chat.off("createChannelSuccess", handleCreateChannelSuccess);
		socket_chat.off("createChannelError", handleCreateChannelError);
	};
	}, [socket_chat]); // not sure
	
	const handleConfirmClick = () => {
		let status: string;

		if (password === "")
			status = 'PUBLIC';
		else
			status = 'PRIVATE';
		
		const updateDTO = {
			name: "#" + channelName,
			status: status,
			password: password
		};

		socket_chat.emit("createChannel", updateDTO);
	};

	return (
		<ModalContainer>
			<PopUpWrapper>
				<h2>&gt; Create Channel</h2>
				<div className="form_container">
					<label>Channel name</label>
					<input
					type="text"
					value={channelName}
					onChange={(e) => setChannelName(e.target.value)} // Update channelName
					placeholder="<type name here>"
					/>
					<label style = {{marginTop: "20px"}}>Password</label>
					<input
					type="text"
					value={password}
					onChange={(e) => setPassword(e.target.value)} // Update channelName
					placeholder="<type password here>"
					/>
					<span>only to create a private channel<br></br>&gt; no password: channel = public</span>
					{errorResponse && (
					<div style={{ color: "red", fontSize: "12px", padding: "5px" }}>{errorResponse}</div>)}
				</div>
				<div className="buttons_container">
					<ConfirmButton type="button" onClick={onCancel}>Cancel</ConfirmButton>
					<ConfirmButton type="submit" onClick={handleConfirmClick}>Confirm</ConfirmButton>
				</div>
			</PopUpWrapper>
		</ModalContainer>
	);
};