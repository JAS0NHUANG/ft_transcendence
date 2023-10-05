import { createPortal } from "react-dom";
import ConfirmButton from "../settings_components/styles/ConfirmButton.styled";
import ChatList from "./ChatList";
import { ChatNavigationStyled } from "./styles/ChatNavigation.styled";
import { NewChannelModal } from "./NewChannelModal";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { Room } from "../../pages/Chat";

interface ChatNavigationProps {
	openChat: (room: Room) => void;
	socket_chat: Socket
}

const ChatNavigation: React.FC<ChatNavigationProps> = ({ openChat, socket_chat }) => {
	const [newChannelModalOpen, setNewChannelModalOpen] = useState(false);

	const handleNewChannel = () => {
		setNewChannelModalOpen(true);
	}

	const handleCancelClick = () => {
		setNewChannelModalOpen(false);
	  };

	return (
		<ChatNavigationStyled>
			<ChatList openChat={openChat}/>
			<div className="buttons">
				<ConfirmButton type="button">New Chat</ConfirmButton>
				<ConfirmButton type="button" onClick={handleNewChannel}>New Channel</ConfirmButton>
			</div>
			{newChannelModalOpen &&
			createPortal(
			<NewChannelModal onCancel={handleCancelClick} socket_chat={socket_chat} />,
			document.body
			)}
		</ChatNavigationStyled>
	);
};

export default ChatNavigation;