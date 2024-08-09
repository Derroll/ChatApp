import { useEffect, useRef, useState } from "react";
import '../Api/generateAI';
import './Chat.css';
import { generateAIApi } from "../Api/generateAI";
import { uploadPDF } from "../Api/uploadPDF";
import logo from "../Images/logo.png";
import pdfLogo from "../Images/pdf_logo.png";

function Chat() {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

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
    const uploadFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }
    const handleFileChange = async(e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const uploadResponse = await uploadPDF(selectedFile);
            if (uploadResponse) {
                setMessageList(prevList => [...prevList, { sender: 'User', text: `Upload successful`, filename: selectedFile.name }]);
            }
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <img className="logo" src={logo} />
                <p className="app-name">PDFWisdomBot</p>
            </div>
            <div className="chat-window">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                <button className="chat-upload" onClick={uploadFile}>&#11014;</button>
                <div>
                    <input
                        className="chat-message-input"
                        type="text"
                        placeholder="Message PDFWisdomBot"
                        value={currentMessage}
                        onChange={(event) => {
                            setCurrentMessage(event.target.value);
                        }}
                    />
                </div>
                <button className="chat-send" onClick={sendMessage}>&#9658;</button>
            </div>
            <div className="chat-body">
                {messageList.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender}`}>
                        <p>{message.text}</p>
                        {message.filename && (
                            <div>
                                <img className="pdf-logo" src={pdfLogo} />
                                <span>{message.filename}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Chat;