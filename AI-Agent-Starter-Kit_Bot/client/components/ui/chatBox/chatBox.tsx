import { useCallback, useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaCirclePlus, FaUserAstronaut } from "react-icons/fa6";
import { FaArrowCircleUp } from "react-icons/fa";
import styles from "./chatBox.module.css"

interface ChatBoxProps {
    onSendMessage: (message: string, image?: File) => Promise<{ success: boolean, message?: string }>;
}

type ChatBoxUser = 'agent' | 'user';

interface ChatBoxMessage {
    message: string;
    image?: File;
    imagePreview?: string;
    timestamp: string;
    user: ChatBoxUser;
    id: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onSendMessage }) => {
    const [messages, setMessages] = useState<ChatBoxMessage[]>([
        {
            message: "Hey! I'm Monty, your AI agent. How can I help you today?",
            timestamp: new Date().toLocaleString(),
            user: 'agent',
            id: 0,
        }
    ]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [imageToUpload, setImageToUpload] = useState<File>();
    const [inputMessage, setInputMessage] = useState<string>('');
    const [nextMessageId, setNextMessageId] = useState<number>(0);
    const chatRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = useCallback(async () => {
        if (!inputMessage && !imageToUpload) return;
        let nextMessageIdToUse = nextMessageId;
        let currentMessages = [...messages];

        const newMessage: ChatBoxMessage = {
            message: inputMessage,
            image: imageToUpload,
            timestamp: new Date().toLocaleString(),
            user: 'user',
            id: nextMessageIdToUse++,
        }

        setMessages([...currentMessages, newMessage]);
        setNextMessageId(nextMessageIdToUse);
        setIsTyping(true);
        const response = await onSendMessage(inputMessage, imageToUpload);
        setIsTyping(false);
        setImageToUpload(undefined);
        setInputMessage('');

        if (!response.success) {
            console.error("Error sending message:", response.message);
            return;
        }

        const agentMessage: ChatBoxMessage = {
            message: response.message || 'Success',
            timestamp: new Date().toLocaleString(),
            user: 'agent',
            id: nextMessageIdToUse++,
        }

        setNextMessageId(nextMessageIdToUse);
        setMessages([...currentMessages, agentMessage]);
    }, [
        inputMessage,
        imageToUpload,
        messages,
        nextMessageId,
        onSendMessage
    ]);

    const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files?.[0];
        if (!image) return;

        setImageToUpload(image);
    }, []);

    const handleChangeInputMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(event.target.value);
    }, []);

    useEffect(() => {
        // populate image previews if they are not already set
        const setImagePreviews = async () => {
            const currentMessages = [...messages];
            for (const msg of currentMessages) {
                if (msg.image && !msg.imagePreview) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        msg.imagePreview = reader.result as string;
                    }
                    reader.readAsDataURL(msg.image);
                }
            }
            setMessages(currentMessages);
        }
        
        setImagePreviews();
    }, [messages.length])



    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatBox} ref={chatRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.message} ${msg.user === "user" ? styles.userMessage : ""}`}>
                        <div className={styles.avatar}>
                            {msg.user === "user" ? <FaUser /> : <FaUserAstronaut />}
                        </div>
                        <div className={`${styles.bubble} ${msg.user === "user" ? styles.userBubble : styles.computerBubble}`}>
                            {msg.message && <p>{msg.message}</p>}
                            {msg.image && <img src={msg.imagePreview} alt="Sent" className={styles.messageImage} />}
                            <span className={styles.timestamp}>{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                {isTyping && <div className={styles.typing}>Computer is typing...</div>}
            </div>
            <div className={styles.inputBox}>
                <div className={styles.fileInputContainer}>
                    <input 
                        className={styles.fileInput} 
                        id="fileInput" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                    />
                    <label htmlFor="fileInput" className={styles.fileInputIcon}>
                        <FaCirclePlus />
                    </label>

                </div>
                <input
                    className={styles.textInput}
                    type="text"
                    placeholder="Send a message"
                    value={inputMessage}
                    onChange={handleChangeInputMessage}
                />
                <div className={`${styles.fileInputContainer} ${styles.sendButton}`}>
                    <FaArrowCircleUp onClick={handleSendMessage} />
                </div>
            </div>
        </div>
    )
}

export default ChatBox;