import { useEffect, useState } from "react";
import PageContainer from "../components/PageContainer";
import ChatNavigation from "../components/chat_components/ChatNavigation";
import { ChatWrapper } from "../components/chat_components/styles/ChatWrapper.styled";
import Landing from "../pages/Landing";
import ConversationWindow from "../components/chat_components/Conversation_component/ConversationWindow";
import { ConversationWindowWrapper } from "../components/chat_components/Conversation_component/styles/ConversationWindow.styled";
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie";

export interface Room {
	name: string,
  status: string,
  role: string,
}

const Chat = () => {
  // ouverture de socket
  const access_token: string = Cookies.get("jwt")!;
  const socket_chat: Socket = io(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
  extraHeaders: {
    Authorization: access_token,
    },
  });

  const [chatName, setChatName] = useState("");

  const openChat = (room: Room) => {
    setChatName(room.name);
  }

	useEffect(() => {
    socket_chat.connect();
    // socket_chat?.emit("updateHistory");
    return () => {
      socket_chat.disconnect();
    }
  }, [])


  return (
    <>
      <Landing />
      <PageContainer type="other">
      <ChatWrapper>
        <ChatNavigation openChat={openChat} socket_chat={socket_chat}/>
        <ConversationWindowWrapper>
          {chatName && <ConversationWindow chatName={chatName} />}
        </ConversationWindowWrapper>
      </ChatWrapper >
      </PageContainer>
    </>
  )
};

export default Chat;