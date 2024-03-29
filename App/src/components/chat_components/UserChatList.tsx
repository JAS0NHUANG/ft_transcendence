import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Avatar, ChatContainer, Username } from './styles/UserChatList.styled';
import { Room } from '../../pages/Chat';

interface ItemProps {
  room: Room;
  handleOpenChat: (room: Room, roomName: string | null) => void;
  isSelected: boolean;
}

function Item({ room, handleOpenChat, isSelected }: ItemProps) {
  const [directMessageName, setDirectMessageName] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState("/src/assets/img/Web_img.jpg");

  useEffect(() => {
    const fetchUserName = async () => {
      if (room.status === 'DIRECT') {
        try {
          const response1 = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/channel/otherUser?name=${room.name}`, // Update this endpoint accordingly
            { withCredentials: true }
          );
          setDirectMessageName(response1.data.userName);

          const response2 = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/user/userByUsername?userName=${response1.data.userName}`,
            { withCredentials: true }
          );
          setAvatarPath(`data:image/png;base64,${response2.data.avatar}`)

        } catch (error) {
          console.error('Error fetching user data:', error);
          // Handle errors if needed
        }
      }
    };

    fetchUserName(); // Call the function when the component mounts
  }, [room]); // Run the effect whenever `room` prop changes

  const openConversation = () => {
    let roomName: string | null = room.name;

    if (room.status === 'DIRECT')
      roomName = directMessageName;

      handleOpenChat(room, roomName);
  };

  return (
    <ChatContainer
      onClick={openConversation}
      selected={isSelected}
    >
      <div className="avatar">
        <Avatar src={avatarPath} alt="room_avatar" />
      </div>
      <Username>{directMessageName || room.name}</Username>
      {room.status === 'PRIVATE' && <img src="/src/assets/icon/Lock.svg" alt="lock_icon" />}
    </ChatContainer>
  );
}

interface UserChatListProps {
  openChat: (room: Room, roomName: string | null) => void;
}

const UserChatList: React.FC<UserChatListProps> = ({ openChat }) => {
  const [chatList, setChatList] = useState<Room[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null); // Lifted state for selected item

  const handleOpenChat = (room: Room, roomName: string | null) => {
    openChat(room, roomName);
    setSelectedChat(room.name); // Update the selected chat in the parent component
  };

  useEffect(() => {
    const getChatList = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/myRooms`,
          { withCredentials: true }
        );
        setChatList(response.data);
      } catch (error) {
        console.error('Error fetching chat list:', error);
        // Handle errors if needed
      }
    };

    getChatList();
  }, []); // Run this effect only once when the component mounts

  return (
    <div>
      {chatList.map((room, index) => (
        <Item
        key={index}
        room={room}
        handleOpenChat={handleOpenChat}
        isSelected={selectedChat === room.name} // Pass isSelected prop to Item component
        />
      ))}
    </div>
  );
};

export default UserChatList;

// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { Avatar, ChatContainer, ChatListWrapper, Username } from './styles/UserChatList.styled';
// import { Room } from '../../pages/Chat';

// interface UserChatListProps {
//   openChat: (room: Room, roomName: string | null) => void;
// }

// const UserChatList: React.FC<UserChatListProps> = ({ openChat }) => {
//   const [ChatList, setChatList] = useState<Room[]>([]);

//   const getChatList = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/user/myRooms`, // using friends list to test front: /chat/rooms
//         { withCredentials: true }
//       );
//       console.log(response);
//       setChatList(response.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getChatList();
//   }, []); // Add an empty dependency array to run this effect only once

//   return (
//     <ChatListWrapper>
//         {Item(ChatList, openChat)}
//     </ChatListWrapper>
//   );
// }

// export default UserChatList;

// function Item(data: Room[], openChat: (room: Room, roomName: string | null) => void) {
//   const [selectedChat, setSelectedChat] = useState<string | null>(null);

//   const openConversation = (room: Room) => {
//     console.log(room + ": j'ai click pour ouvrir une conv");
//     setSelectedChat(room.name);
//     openChat(room, room.name); // I CHANGED HERE TO ADAPT
//   }

//   return (
//     <>
//       {data.map((value, index) => (
//         <ChatContainer 
//         key={index} 
//         onClick={() => openConversation(value)}
//         selected={selectedChat === value.name}
//         >
//           <div className="avatar">
//             <Avatar src="/src/assets/img/Web_img.jpg" alt="room_avatar" />
//           </div>
//           <Username>{value.name}</Username>
//           {value.status === 'PRIVATE' && <img src="/src/assets/icon/Lock.svg" alt="lock_icon" />}
//         </ChatContainer>
//       ))}
//     </>
//   );
// }