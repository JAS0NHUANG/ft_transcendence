# Websocket with Socket.io

- Basic Websocket gateway  

- Still considering setting only one gateway as the unique entry point to the backend socket.io server (like here) or seperate game and chat gateways in their own modules.  
(Was using 2 seperate gateways for game and chat. Changed it to a generic/unique gateway for the whole site.)    

- No frontend for now. Need Postman or other client for testing.  

## Event Listener (Clients -> Server)
### GAME
- startGame
User click on "play" button.  
Will create a new game or join an existing game.  

- pauseGame

- inviteUserToPlay

- movePaddle

### CHAT
- startChat

- inviteUserToChat

- joinChanel

- leaveChanel

- kickUserFromChanel
Admin of chanel.  

- banUserFromChanel
Admin of chanel.  

- unBanUserFromChanel
Admin of chanel.  

- muteUser
For only the user who sent the request.  

- unMuteUser

- message

## Event Emitter (Server -> Clients)
### GAME
- gameLoop
30fps

### CHAT 
- messageBroadcast

- userJoined
