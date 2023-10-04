import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Avatar, ChatContainer, ChatListWrapper, Username } from './styles/NewChatModal.styled';

interface Channel {
	name: string,
  	status: string,
  	createdAt: string
}

const AllChannelsList: React.FC = () => {
  const [allChannelList, setAllChannelList] = useState<Channel[]>([]);

  const getAllChannelList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/chat/allChannels`, // using friends list to test front: /chat/Channels
        { withCredentials: true }
      );
      console.log(response);
      setAllChannelList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllChannelList();
  }, []); // Add an empty dependency array to run this effect only once

  return (
    <ChatListWrapper>
        {Item(allChannelList)}
    </ChatListWrapper>
  );
}

export default AllChannelsList;

function Item(data: Channel[]) {
	const [selectedChat, setSelectedChat] = useState<string | null>(null);

	const openConversation = (channel: Channel) => {
	console.log(channel + ": j'ai click pour ouvrir une conv");
	setSelectedChat(channel.name);
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
