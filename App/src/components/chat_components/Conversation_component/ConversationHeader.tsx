import { ConversationHeaderWrapper, RoomName } from "./styles/ConversationHeader.styled";
import iconSrc from "../../../../public/icon/Settings.svg";

interface ConversationHeaderProps {
	chatName: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ chatName }) => {
  
	const onClick =() => {

	};

	return (
	  <ConversationHeaderWrapper>
		<RoomName>{chatName}</RoomName>
		<img src={iconSrc} alt="settings_icon" onClick={onClick}/>
	  </ConversationHeaderWrapper>
	)
  };
  
export default ConversationHeader;