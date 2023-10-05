import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Avatar, ChatContainer, ChatListWrapper, Username } from './styles/ChatList.styled';
import { Room } from '../../pages/Chat';

interface ChatListProps {
  openChat: (room: Room) => void;
}

const ChatList: React.FC<ChatListProps> = ({ openChat }) => {
  const [ChatList, setChatList] = useState<Room[]>([]);

  const getChatList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/channel/rooms`, // using friends list to test front: /chat/rooms
        { withCredentials: true }
      );
      console.log(response);
      setChatList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getChatList();
  }, []); // Add an empty dependency array to run this effect only once

  return (
    <ChatListWrapper>
        {Item(ChatList, openChat)}
    </ChatListWrapper>
  );
}

export default ChatList;

function Item(data: Room[], openChat: (room: Room) => void) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const openConversation = (room: Room) => {
    console.log(room + ": j'ai click pour ouvrir une conv");
    setSelectedChat(room.name);
    openChat(room);
  }

  return (
    <>
      {data.map((value, index) => (
        <ChatContainer 
        key={index} 
        onClick={() => openConversation(value)}
        selected={selectedChat === value.name}
        >
          <div className="avatar">
            <Avatar src="../../../public/img/Web_img.jpg" alt="room_avatar" />
          </div>
          <Username>{value.name}</Username>
          {value.status === 'PRIVATE' && <img src="../../../public/icon/Lock.svg" alt="lock_icon" />}
        </ChatContainer>
      ))}
    </>
  );
}
