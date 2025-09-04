import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatSystem.css'; // Custom CSS for ChatSystem

const ChatSystem = ({ isAdmin, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChat, setActiveChat] = useState(null); // For admin: currently selected user chat
    const [usersWithChats, setUsersWithChats] = useState([]); // For admin: list of users who have initiated chats
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isAdmin) {
            fetchUsersWithChats();
        } else {
            fetchMessages(userId); // Fetch messages for the current user
        }
    }, [isAdmin, userId, activeChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchUsersWithChats = async () => {
        try {
            const response = await axios.get('/api/admin/chats');
            setUsersWithChats(response.data.users);
            if (!activeChat && response.data.users.length > 0) {
                setActiveChat(response.data.users[0].id); // Auto-select first chat for admin
            }
        } catch (error) {
            console.error('Error fetching users with chats:', error);
        }
    };

    const fetchMessages = async (chatUserId) => {
        if (!chatUserId) return;
        try {
            const endpoint = isAdmin ? `/api/admin/chats/${chatUserId}` : `/api/user/chats`;
            const response = await axios.get(endpoint);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const payload = {
            recipient_id: isAdmin ? activeChat : null, // Admin sends to activeChat user, user sends to admin
            message: newMessage,
            is_admin_message: isAdmin,
        };

        try {
            const endpoint = isAdmin ? `/api/admin/chats/${activeChat}` : `/api/user/chats`;
            await axios.post(endpoint, payload);
            setNewMessage('');
            fetchMessages(isAdmin ? activeChat : userId); // Refresh messages after sending
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-system-container">
            {isAdmin && (
                <div className="chat-sidebar">
                    <h3>Active Chats</h3>
                    <ul>
                        {usersWithChats.map(user => (
                            <li
                                key={user.id}
                                className={activeChat === user.id ? 'active' : ''}
                                onClick={() => setActiveChat(user.id)}
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="chat-main">
                <div className="messages-list">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.is_admin_message ? 'admin' : 'user'}`}>
                            <p className="message-sender">{msg.is_admin_message ? 'Admin' : 'You'}</p>
                            <p className="message-content">{msg.content}</p>
                            <span className="message-timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="message-input-form">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isAdmin && !activeChat} // Disable input if admin hasn't selected a chat
                    />
                    <button type="submit" disabled={isAdmin && !activeChat}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatSystem;


