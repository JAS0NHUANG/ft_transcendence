import ConversationFooter from "./ConversationFooter";
import ConversationHeader from "./ConversationHeader";

interface ConversationWindowProps {
	chatName: string;
}

const ConversationWindow: React.FC<ConversationWindowProps> = ({ chatName }) => {
  
	return (
	  <>
		<ConversationHeader chatName={chatName} />
		<div className="conversation_body" />
		<ConversationFooter />
	  </>
	)
  };
  
export default ConversationWindow;