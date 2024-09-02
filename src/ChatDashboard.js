import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, collection, addDoc, getDocs, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import './ChatDashboard.css';

const ChatDashboard = () => {
    const [chatLists, setChatLists] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newChatListName, setNewChatListName] = useState('');
    const [newChatMessage, setNewChatMessage] = useState('');
    const [editingChatId, setEditingChatId] = useState(null);
    const [editingChatContent, setEditingChatContent] = useState('');

    useEffect(() => {
        // Fetch chat lists
        const fetchChatLists = async () => {
            try {
                const chatListsSnapshot = await getDocs(collection(db, 'ChatList'));
                const lists = chatListsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setChatLists(lists);
            } catch (error) {
                console.error('Error fetching chat lists:', error);
            }
        };

        fetchChatLists();
    }, []);

    useEffect(() => {
        if (selectedChatId) {
            // Fetch chat messages for the selected chat list
            const fetchChatMessages = async () => {
                try {
                    const chatListRef = doc(db, 'ChatList', selectedChatId);
                    const chatListDoc = await getDoc(chatListRef);

                    if (chatListDoc.exists()) {
                        const chatList = chatListDoc.data();
                        const messageRefs = chatList.chatMessages || [];

                        const messagePromises = messageRefs.map(ref => getDoc(ref).then(doc => ({ id: doc.id, ...doc.data() })));
                        const loadedMessages = await Promise.all(messagePromises);

                        setMessages(loadedMessages);
                    }
                } catch (error) {
                    console.error('Error fetching chat messages:', error);
                }
            };

            fetchChatMessages();
        }
    }, [selectedChatId]);

    const handleAddChatList = async () => {
        if (newChatListName.trim() === '') return;

        try {
            const docRef = await addDoc(collection(db, 'ChatList'), {
                name: newChatListName,
                user: doc(db, 'Users', auth.currentUser.uid),
                created: serverTimestamp(),
                lastModified: serverTimestamp(),
                chatMessages: []
            });
            setNewChatListName('');
            setChatLists([...chatLists, { id: docRef.id, name: newChatListName, chatMessages: [] }]);
        } catch (e) {
            console.error('Error adding chat list:', e);
        }
    };

    const handleAddChatMessage = async () => {
        if (newChatMessage.trim() === '' || selectedChatId === null) return;

        try {
            const docRef = await addDoc(collection(db, 'ChatMessage'), {
                content: newChatMessage,
                created: serverTimestamp(),
                lastModified: serverTimestamp()
            });

            const chatListRef = doc(db, 'ChatList', selectedChatId);
            const chatListDoc = await getDoc(chatListRef);

            if (chatListDoc.exists()) {
                const chatList = chatListDoc.data();
                const chatMessages = chatList.chatMessages || [];
                chatMessages.push(docRef);

                await updateDoc(chatListRef, {
                    chatMessages,
                    lastModified: serverTimestamp()
                });

                setMessages([...messages, { id: docRef.id, content: newChatMessage }]);
                setNewChatMessage('');
            }
        } catch (e) {
            console.error('Error adding chat message:', e);
        }
    };

    const handleDeleteChatList = async (chatId) => {
        if (window.confirm('Delete Chat List?')) {
            try {
                const chatListDoc = doc(db, 'ChatList', chatId);
                const chatList = await getDoc(chatListDoc);

                if (chatList.exists()) {
                    const chatMessages = chatList.data().chatMessages || [];
                    for (const msgRef of chatMessages) {
                        await deleteDoc(msgRef);
                    }
                }

                await deleteDoc(chatListDoc);
                setChatLists(chatLists.filter(list => list.id !== chatId));
            } catch (e) {
                console.error('Error deleting chat list:', e);
            }
        }
    };

    const handleDeleteChatMessage = async (messageId) => {
        if (window.confirm('Delete Chat Message?')) {
            try {
                await deleteDoc(doc(db, 'ChatMessage', messageId));

                const chatListDoc = doc(db, 'ChatList', selectedChatId);
                const chatList = await getDoc(chatListDoc);

                if (chatList.exists()) {
                    const chatMessages = chatList.data().chatMessages || [];
                    const updatedMessages = chatMessages.filter(msgRef => msgRef.id !== messageId);

                    await updateDoc(chatListDoc, {
                        chatMessages: updatedMessages,
                        lastModified: serverTimestamp()
                    });

                    setMessages(messages.filter(msg => msg.id !== messageId));
                }
            } catch (e) {
                console.error('Error deleting chat message:', e);
            }
        }
    };

    const handleEditChatList = async (chatId) => {
        if (editingChatContent.trim() === '') return;

        try {
            await updateDoc(doc(db, 'ChatList', chatId), {
                name: editingChatContent,
                lastModified: serverTimestamp()
            });

            setChatLists(chatLists.map(list => list.id === chatId ? { ...list, name: editingChatContent } : list));
            setEditingChatId(null);
            setEditingChatContent('');
        } catch (e) {
            console.error('Error editing chat list:', e);
        }
    };

    const handleEditChatMessage = async (messageId) => {
        if (editingChatContent.trim() === '') return;

        try {
            await updateDoc(doc(db, 'ChatMessage', messageId), {
                content: editingChatContent,
                lastModified: serverTimestamp()
            });

            setMessages(messages.map(msg => msg.id === messageId ? { ...msg, content: editingChatContent } : msg));
            setEditingChatId(null);
            setEditingChatContent('');
        } catch (e) {
            console.error('Error editing chat message:', e);
        }
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h2>Chat Lists</h2>
                <input
                    type="text"
                    placeholder="New Chat List"
                    value={newChatListName}
                    onChange={(e) => setNewChatListName(e.target.value)}
                />
                <button className="btn btn-block" onClick={handleAddChatList}>Add Chat List</button>
                <ul className="chat-list">
                    {chatLists.map(chat => (
                        <li key={chat.id} onClick={() => setSelectedChatId(chat.id)}>
                            <button className="reorder-btn">⇅</button>
                            {editingChatId === chat.id ? (
                                <div className="edit-box">
                                    <input
                                        type="text"
                                        value={editingChatContent}
                                        onChange={(e) => setEditingChatContent(e.target.value)}
                                    />
                                    <button className="btn edit-btn" onClick={() => handleEditChatList(chat.id)}>Save</button>
                                    <button className="btn cancel-btn" onClick={() => setEditingChatId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <div className="list-item">
                                    {chat.name}
                                    <div className="btn-container">
                                        <button className="btn" onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteChatList(chat.id);
                                        }}>
                                            <span className="icon">X</span>
                                        </button>
                                        <button className="btn edit-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingChatId(chat.id);
                                            setEditingChatContent(chat.name);
                                        }}>
                                            ✎
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="main-content">
                <h2>Chat Messages</h2>
                <input
                    type="text"
                    placeholder="New Chat Message"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                />
                <button className="btn btn-block" onClick={handleAddChatMessage}>Add Chat Message</button>
                <div className="messages">
                    {messages.map(msg => (
                        <div key={msg.id} className="message">
                            <button className="reorder-btn">⇅</button>
                            {editingChatId === msg.id ? (
                                <div className="edit-box">
                                    <input
                                        type="text"
                                        value={editingChatContent}
                                        onChange={(e) => setEditingChatContent(e.target.value)}
                                    />
                                    <button className="btn edit-btn" onClick={() => handleEditChatMessage(msg.id)}>Save</button>
                                    <button className="btn cancel-btn" onClick={() => setEditingChatId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <div className="message-content">
                                    {msg.content}
                                    <div className="btn-container">
                                        <button className="btn" onClick={() => handleDeleteChatMessage(msg.id)}>
                                            <span className="icon">X</span>
                                        </button>
                                        <button className="btn edit-btn" onClick={() => {
                                            setEditingChatId(msg.id);
                                            setEditingChatContent(msg.content);
                                        }}>
                                            ✎
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatDashboard;
