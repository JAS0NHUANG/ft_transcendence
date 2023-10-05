# Websocket with Socket.io

- Basic Websocket gateway

- Still considering setting only one gateway as the unique entry point to the backend socket.io server (like here) or seperate game and chat gateways in their own modules.  
  (Was using 2 seperate gateways for game and chat. Changed it to a generic/unique gateway for the whole site.)

- No frontend for now. Need Postman or other client for testing.

## CHAT

## General

- handleConnection
	returns the full message history in format Record<roomName, Message[]> {} te be displayed

- handleDisconnection


### HTTP requests

See Swagger at http://localhost:3000/api


### Listen

| event name       | parameters  				| description        																	|
| ---------------- | ------------------ | --------------------------------------------------- |
|	sendMessage			 |	messageDTO				| save message in the database												|
| createChannel		 |	createRoomDTO			| create a public or private channel, or a DM room	  |
|	joinChannel			 |	joinRoomDTO				|	join a public or private channel										|
| ---------------- | ------------------ | --------------------------------------------------- |



### Expected DTO's

| DTO name 			| variable name | descirption  																				|
| ------------- |	-------------	| --------------------------------------------------- |
|	messageDTO		| room					|	destination room name																|
|								| text					|	message text (max 128 characters)										|
| ------------- |	-------------	| --------------------------------------------------- |
|	createRoomDTO	| name					|	channel name (private/public) or username	(direct)	|
| 							|	status				|	'PRIVATE', 'PUBLIC' or 'DIRECT'						  				|
|								| password?			|	mandatory for private rooms													|
| ------------- |	-------------	| --------------------------------------------------- |
|	joinRoomDTO		| name					|	channel name 																				|
| 							|	password?			|	mandatory for private rooms								  				|
| ------------- |	-------------	| --------------------------------------------------- |



### Emit

| event name       			| body            | description 																		|
| --------------------- | ---------------	| ----------------------------------------------- |
| accessDenied		 			| messageBody			| connection to gateway failed										|
| reconnectNeeded  			| messageBody		  | prompt to refresh chat socket upon DM creation	|
| createChannelSuccess	| messageBody			|	channel has been created succesfully						|
| createChannelError		| messageBody			|	error creating channel													|
| joinChannelSuccess		| messageBody			|	user has joined channel succesfully							|
| joinChannelError			| messageBody			|	error joining channel														|
| leaveChannelSuccess		| messageBody			|	user has left channel succesfully								|
| leaveChannelError			| messageBody			|	error leaving channel														|
| sendMessageSuccess		| messageBody			|	message has been saved in the database					|
| sendMessageError			| messageBody			|	error sending message														|
| --------------------- | ---------------	| ----------------------------------------------- |

