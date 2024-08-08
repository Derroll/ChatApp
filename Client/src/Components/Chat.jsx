import { useEffect, useState } from "react";
import '../Api/generateAI';
import './Chat.css';
import { generateAIApi } from "../Api/generateAI";

function Chat() {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    const callGenerateAI = async (currentMessage) => {
        try {
            const response = await generateAIApi(currentMessage);
            const aiMessage = response.data;
            setMessageList(prevList => [...prevList, { sender: 'AI', text: aiMessage }]);
        } catch (error) {
            console.log(error);
        }
    }
    const sendMessage = () => {
        if (currentMessage !== "") {
            setMessageList(prevList => [...prevList, { sender: 'User', text: currentMessage }]);
            callGenerateAI(currentMessage);
            setCurrentMessage("");
        }
    }
    return (
        <div className="chat-container">
            <div className="chat-header">
                <p>ChatGPT: DOG BREEDS CHARACTERISTICS AND BEHAVIORS</p>
            </div>
            <div className="chat-body">
                {messageList.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender}`}>
                        <p>{message.text}</p>
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <div>
                    <input
                        className="chat-message-input"
                        type="text"
                        placeholder="Message ChatGPT"
                        value={currentMessage}
                        onChange={(event) => {
                            setCurrentMessage(event.target.value);
                        }}
                    />
                </div>
                <button className="chat-send" onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    );
}

export default Chat;