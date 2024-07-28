import { useState } from "react";
import { WaitingRoom } from "./components/WaitingRoom.jsx";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Chat } from "./components/Chat.jsx";

const App = () => {
	const [connection, setConnection] = useState(null);
	const [messages, setMessages] = useState([]);
	const [chatRoom, setChatRoom] = useState([]);

	const joinChat = async (userName, chatRoom) => {
		var connection = new HubConnectionBuilder()
			.withUrl("http://localhost:5022/chat")
			.withAutomaticReconnect()
			.build();

		connection.on("ReceiveMessage", (userName, message) => {
			setMessages((messages) => [...messages, { userName, message }]);
		});

		try {
			await connection.start();
			await connection.invoke("JoinChat", { userName, chatRoom });

			setConnection(connection);
			setChatRoom(chatRoom);
		} catch (error) {
			console.log(error);
		}
	};

	const sendMessage = async (message) => {
		await connection.invoke("SendMessage", message);
	};

	const closeChat = async () => {
		await connection.stop();
		setConnection(null);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			{connection ? (
				<Chat
					messages={messages}
					sendMessage={sendMessage}
					closeChat={closeChat}
					chatRoom={chatRoom}
				/>
			) : (
				<WaitingRoom joinChat={joinChat} />
			)}
		</div>
	);
};

export default App;
