import { createPortal } from "react-dom";
import ConfirmButton from "../settings_components/styles/ConfirmButton.styled";
import ChatList from "./ChatList";
import { ChatNavigationStyled } from "./styles/ChatNavigation.styled";
import { NewChannelModal } from "./NewChannelModal";
import { useState } from "react";

const ChatNavigation: React.FC = () => {
	const [newChannelModalOpen, setNewChannelModalOpen] = useState(false);

	const handleNewChannel = () => {
		setNewChannelModalOpen(true);
	}

	const handleCancelClick = () => {
		setNewChannelModalOpen(false);
	  };

	return (
		<ChatNavigationStyled>
			<ChatList />
			<div className="buttons">
				<ConfirmButton type="button">New Chat</ConfirmButton>
				<ConfirmButton type="button" onClick={handleNewChannel}>New Channel</ConfirmButton>
			</div>
			{newChannelModalOpen &&
			createPortal(
			<NewChannelModal onCancel={handleCancelClick} />,
			document.body
			)}
		</ChatNavigationStyled>
	);
};

export default ChatNavigation;