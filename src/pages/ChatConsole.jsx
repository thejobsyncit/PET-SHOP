import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, MessageSquare, User, RefreshCw } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const ChatConsole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [rooms, setRooms] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access the message console.');
      navigate('/login');
      return;
    }
    loadRooms();
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if redirecting from a listing with recipient data
    if (location.state && location.state.recipientId) {
      const recipientId = location.state.recipientId;
      const ownerName = location.state.ownerName || 'Breeder / Owner';
      
      // Auto-set as active contact
      setActiveContact({ _id: recipientId, name: ownerName });
      loadMessages(recipientId);
    }
  }, [location.state]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await apiRequest('/chats/rooms');
      if (data.success) {
        setRooms(data.rooms);
        // Pre-select first room if no contact is selected
        if (data.rooms.length > 0 && !activeContact) {
          setActiveContact(data.rooms[0]);
          loadMessages(data.rooms[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMessages = async (contactId) => {
    setLoadingMessages(true);
    try {
      const data = await apiRequest(`/chats/messages/${contactId}`);
      if (data.success) {
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    loadMessages(contact._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    try {
      const data = await apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: activeContact._id,
          messageText: newMessage
        })
      });

      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage('');
        scrollToBottom();
        // Refresh rooms sidebar to pull latest contacts list
        loadRoomsWithoutReset();
      }
    } catch (err) {
      toast.error('Message transmission failed.');
    }
  };

  const loadRoomsWithoutReset = async () => {
    try {
      const data = await apiRequest('/chats/rooms');
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {}
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pb-20">
      
      <div className="flex justify-between items-center border-b border-beige pb-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">💬 DISCUSSION CENTER</span>
          <h1 className="font-serif text-xl md:text-2xl text-primary font-medium mt-1">Direct Messaging</h1>
        </div>
        <button 
          onClick={loadRooms}
          className="p-2 border border-beige hover:border-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition"
        >
          <RefreshCw size={12} /> REFRESH
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 border border-beige bg-white h-[65vh] shadow-sm overflow-hidden">
        
        {/* SIDEBAR: CONTACT ROOMS (Left 4 columns) */}
        <aside className="md:col-span-4 border-r border-beige flex flex-col">
          <div className="bg-secondary p-4 border-b border-beige text-xs font-bold text-primary uppercase tracking-wider">
            Active Chats
          </div>
          <div className="flex-grow overflow-y-auto divide-y divide-beige">
            {loadingRooms ? (
              <p className="p-4 text-xs text-gray-400">Loading contacts list...</p>
            ) : rooms.length > 0 ? (
              rooms.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-4 text-xs transition flex items-center gap-3 ${
                    activeContact?._id === contact._id 
                      ? 'bg-secondary font-bold text-primary' 
                      : 'text-gray-600 hover:bg-secondary'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="font-bold truncate">{contact.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{contact.email}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="p-6 text-xs text-gray-400 text-center italic">No active conversations found. Open a classified listing to message owners.</p>
            )}
          </div>
        </aside>

        {/* CHAT MESSAGES WINDOW (Right 8 columns) */}
        <section className="md:col-span-8 flex flex-col justify-between h-full">
          {activeContact ? (
            <>
              {/* Top active contact name */}
              <div className="bg-secondary p-4 border-b border-beige text-xs font-bold text-primary flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                  {activeContact.name[0]}
                </div>
                <span>Correspondence with {activeContact.name}</span>
              </div>

              {/* Scrolling messages list */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#FAFBF9]">
                {loadingMessages ? (
                  <p className="text-xs text-gray-400 text-center">Loading message logs...</p>
                ) : messages.length > 0 ? (
                  messages.map((m) => {
                    const isMe = (m.sender?._id || m.sender) === user._id.toString();
                    return (
                      <div 
                        key={m._id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-md p-3.5 text-xs shadow-sm rounded-none border ${
                            isMe 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white text-gray-700 border-beige'
                          }`}
                        >
                          <p className="leading-relaxed">{m.messageText}</p>
                          <span className="block text-[8px] text-right mt-1 opacity-70">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 text-center italic py-20">Send a greeting message to initiate contact.</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input text message box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-beige bg-white flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Type message content here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow px-3 py-2.5 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-white hover:bg-accent hover:text-primary transition cursor-pointer flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-8 space-y-3">
              <MessageSquare size={36} className="text-gray-300 animate-bounce" />
              <h3 className="font-serif text-sm font-semibold text-primary">No Active Conversation Room</h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Click on a listing in the Pet Classifieds tab to initiate contact with breeders or shelter staff.
              </p>
            </div>
          )}
        </section>

      </div>

    </div>
  );
};

export default ChatConsole;
