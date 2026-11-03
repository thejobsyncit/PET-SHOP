import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, MessageSquare, User, RefreshCw, ArrowLeft, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { getPetListingById } from '../data/classifiedsData.js';
import toast from 'react-hot-toast';

// Safe LocalStorage helpers for chat persistence across page refreshes and sessions
const getChatStorageKey = (userId, contactId) => `joshpetshub_chat_msgs_${userId || 'usr'}_${contactId || 'unknown'}`;

const getStoredLocalMessages = (userId, contactId) => {
  if (!contactId) return [];
  try {
    const raw = localStorage.getItem(getChatStorageKey(userId, contactId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
};

const saveStoredLocalMessages = (userId, contactId, messages) => {
  if (!contactId || !Array.isArray(messages)) return;
  try {
    localStorage.setItem(getChatStorageKey(userId, contactId), JSON.stringify(messages.slice(-200)));
  } catch (_) {}
};

// Helper to resolve listing details from id or fallback
const resolvePetListing = (listingId, fallbackListing) => {
  if (fallbackListing && fallbackListing.title) return fallbackListing;
  if (!listingId) return fallbackListing || null;
  try {
    const pet = getPetListingById(listingId);
    if (pet) {
      return {
        id: pet._id || pet.id,
        title: pet.title,
        image: pet.images?.[0] || pet.image,
        price: pet.price,
        breed: pet.breed,
        sellerId: pet.user?._id || pet.user?.id || pet.sellerId,
        sellerName: pet.user?.name || pet.sellerName,
        sellerEmail: pet.user?.email || pet.sellerEmail
      };
    }
  } catch (_) {}
  return fallbackListing || null;
};

const ChatConsole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const currentUserId = (user?._id || user?.id || user?.email || 'user-default').toString();
  const contactParam = searchParams.get('contact');
  const listingParam = searchParams.get('listing');

  // Read saved active chat metadata from sessionStorage or localStorage
  const getPersistedChatMeta = () => {
    try {
      const fromSession = sessionStorage.getItem('joshpetshub_active_chat');
      if (fromSession) return JSON.parse(fromSession);
    } catch (_) {}
    try {
      const fromLocal = localStorage.getItem('joshpetshub_last_active_chat');
      if (fromLocal) return JSON.parse(fromLocal);
    } catch (_) {}
    return null;
  };

  const initialMeta = getPersistedChatMeta();

  // Resolve initial active contact from state, search params, or persistent cache
  const initialContactId = (
    location.state?.recipientId ||
    contactParam ||
    initialMeta?.recipientId ||
    initialMeta?.id ||
    initialMeta?._id ||
    ''
  ).toString();

  const initialListingId = location.state?.listingId || listingParam || initialMeta?.listingId || initialMeta?.listing?.id;
  const initialResolvedListing = resolvePetListing(initialListingId, {
    id: initialListingId,
    title: location.state?.listingTitle || initialMeta?.listingTitle || initialMeta?.listing?.title,
    image: location.state?.listingImage || initialMeta?.listingImage || initialMeta?.listing?.image,
    price: location.state?.listingPrice || initialMeta?.listingPrice || initialMeta?.listing?.price,
    breed: location.state?.listingBreed || initialMeta?.listingBreed || initialMeta?.listing?.breed
  });

  const [activeContact, setActiveContact] = useState(() => {
    if (!initialContactId) return null;
    return {
      _id: initialContactId,
      id: initialContactId,
      name: location.state?.ownerName || initialMeta?.ownerName || initialMeta?.name || initialResolvedListing?.sellerName || 'Pet Breeder / Seller',
      email: location.state?.ownerEmail || initialMeta?.ownerEmail || initialMeta?.email || initialResolvedListing?.sellerEmail || '',
      listingTitle: initialResolvedListing?.title || null
    };
  });

  const [listingContext, setListingContext] = useState(initialResolvedListing);

  const [messages, setMessages] = useState(() => {
    if (initialContactId) {
      return getStoredLocalMessages(currentUserId, initialContactId);
    }
    return [];
  });

  const [rooms, setRooms] = useState(() => {
    if (initialContactId) {
      return [{
        _id: initialContactId,
        id: initialContactId,
        name: location.state?.ownerName || initialMeta?.ownerName || initialMeta?.name || initialResolvedListing?.sellerName || 'Pet Breeder / Seller',
        email: location.state?.ownerEmail || initialMeta?.ownerEmail || initialMeta?.email || initialResolvedListing?.sellerEmail || '',
        listingTitle: initialResolvedListing?.title || null
      }];
    }
    return [];
  });

  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(Boolean(initialContactId));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const activeContactRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access the message console.');
      navigate('/login', { state: { from: '/chat' } });
      return;
    }
    loadRooms();
  }, [isAuthenticated]);

  // Persist whenever activeContact or listingContext updates
  useEffect(() => {
    if (activeContact) {
      const contactId = (activeContact._id || activeContact.id).toString();
      const meta = {
        recipientId: contactId,
        id: contactId,
        _id: contactId,
        ownerName: activeContact.name,
        name: activeContact.name,
        ownerEmail: activeContact.email,
        email: activeContact.email,
        listingId: listingContext?.id,
        listingTitle: listingContext?.title,
        listingImage: listingContext?.image,
        listingPrice: listingContext?.price,
        listingBreed: listingContext?.breed
      };
      try {
        sessionStorage.setItem('joshpetshub_active_chat', JSON.stringify(meta));
        localStorage.setItem('joshpetshub_last_active_chat', JSON.stringify(meta));
      } catch (_) {}

      // Keep URL search params in sync so reloading address maintains the chat
      if (searchParams.get('contact') !== contactId || (listingContext?.id && searchParams.get('listing') !== listingContext.id)) {
        const nextParams = { contact: contactId };
        if (listingContext?.id) nextParams.listing = listingContext.id;
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [activeContact, listingContext]);

  // Handle incoming redirect state (e.g. clicking CHAT on a pet classified card)
  useEffect(() => {
    if (location.state && location.state.recipientId) {
      const recipientId = (location.state.recipientId || '').toString();
      const ownerName = location.state.ownerName || 'Breeder / Seller';

      const listing = {
        id: location.state.listingId,
        title: location.state.listingTitle,
        image: location.state.listingImage,
        price: location.state.listingPrice,
        breed: location.state.listingBreed
      };

      if (listing.title) {
        setListingContext(listing);
      }

      const contact = {
        _id: recipientId,
        id: recipientId,
        name: ownerName,
        email: location.state.ownerEmail || '',
        listingTitle: listing.title || null
      };

      setActiveContact(contact);
      setShowMobileChat(true);

      setRooms((prev) => {
        const exists = prev.some((r) => (r._id || r.id).toString() === recipientId);
        if (!exists) {
          return [contact, ...prev];
        }
        return prev;
      });

      loadMessages(recipientId);
    }
  }, [location.state]);

  // Load conversation messages whenever activeContact changes
  useEffect(() => {
    if (activeContact) {
      const cId = (activeContact._id || activeContact.id).toString();
      loadMessages(cId);
    }
  }, [activeContact?._id, activeContact?.id]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await apiRequest('/chats/rooms');
      const serverRooms = data && data.success && Array.isArray(data.rooms) ? data.rooms : [];

      setRooms((prev) => {
        const roomMap = new Map();

        // 1. Keep active contact first
        if (activeContactRef.current) {
          const actId = (activeContactRef.current._id || activeContactRef.current.id).toString();
          roomMap.set(actId, activeContactRef.current);
        }

        // 2. Add server rooms
        serverRooms.forEach((r) => {
          const rId = (r._id || r.id).toString();
          roomMap.set(rId, r);
        });

        // 3. Keep previous client rooms
        prev.forEach((p) => {
          const pId = (p._id || p.id).toString();
          if (!roomMap.has(pId)) roomMap.set(pId, p);
        });

        return Array.from(roomMap.values());
      });

      // If no contact is currently selected and server provided rooms, pre-select first room
      if (!activeContactRef.current && serverRooms.length > 0) {
        setActiveContact(serverRooms[0]);
        loadMessages(serverRooms[0]._id || serverRooms[0].id);
      }
    } catch (err) {
      console.warn('Could not load chat rooms from server:', err.message);
      if (activeContactRef.current) {
        setRooms([activeContactRef.current]);
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMessages = async (contactId) => {
    if (!contactId) return;
    const cid = contactId.toString();

    // 1. Immediately hydrate from local storage cache so chat box is NEVER empty!
    const localCached = getStoredLocalMessages(currentUserId, cid);
    if (localCached.length > 0) {
      setMessages(localCached);
      scrollToBottom();
    }

    setLoadingMessages(localCached.length === 0);

    try {
      const data = await apiRequest(`/chats/messages/${cid}`);
      if (data && data.success && Array.isArray(data.messages)) {
        const seenIds = new Set();
        const merged = [];

        data.messages.forEach((m) => {
          const mId = m._id || m.id;
          if (mId) seenIds.add(mId.toString());
          merged.push(m);
        });

        // Add any local messages not yet in server list
        localCached.forEach((l) => {
          const lId = (l._id || l.id || '').toString();
          if (lId && !seenIds.has(lId)) {
            const isDuplicate = merged.some(
              (m) => m.messageText === l.messageText && Math.abs(new Date(m.createdAt || 0) - new Date(l.createdAt || 0)) < 15000
            );
            if (!isDuplicate) {
              merged.push(l);
              seenIds.add(lId);
            }
          }
        });

        merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        setMessages(merged);
        saveStoredLocalMessages(currentUserId, cid, merged);
        scrollToBottom();
      }
    } catch (err) {
      console.warn('Could not load conversation history from server, keeping local cache:', err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setShowMobileChat(true);

    const contactId = (contact._id || contact.id).toString();
    try {
      const toSave = {
        recipientId: contactId,
        id: contactId,
        _id: contactId,
        ownerName: contact.name,
        name: contact.name,
        ownerEmail: contact.email,
        email: contact.email,
        listingTitle: contact.listingTitle || listingContext?.title,
        listingImage: listingContext?.image,
        listingPrice: listingContext?.price,
        listingBreed: listingContext?.breed
      };
      sessionStorage.setItem('joshpetshub_active_chat', JSON.stringify(toSave));
      localStorage.setItem('joshpetshub_last_active_chat', JSON.stringify(toSave));
      setSearchParams({ contact: contactId }, { replace: true });
    } catch (_) {}

    loadMessages(contactId);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const contactId = (activeContact._id || activeContact.id).toString();
    const currentUserName = user?.name || 'Pet Parent';
    const textToSend = newMessage.trim();

    const payload = {
      recipientId: contactId,
      recipientName: activeContact.name,
      messageText: textToSend,
      listingId: listingContext?.id || location.state?.listingId || undefined,
      listingTitle: listingContext?.title || location.state?.listingTitle || undefined,
      listingImage: listingContext?.image || location.state?.listingImage || undefined
    };

    const optimisticMsg = {
      _id: `MSG-LOCAL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: {
        _id: currentUserId,
        id: currentUserId,
        name: currentUserName,
        email: user?.email || ''
      },
      recipient: {
        _id: contactId,
        id: contactId,
        name: activeContact.name
      },
      messageText: textToSend,
      listingTitle: payload.listingTitle,
      listingImage: payload.listingImage,
      createdAt: new Date().toISOString()
    };

    // 1. Immediately store and display
    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      saveStoredLocalMessages(currentUserId, contactId, updated);
      return updated;
    });
    setNewMessage('');
    scrollToBottom();
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 10);

    // 2. Transmit to backend
    try {
      const data = await apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data && (data.success || data.message)) {
        const saved = data.message;
        if (saved && saved._id) {
          setMessages((prev) => {
            const replaced = prev.map((m) => (m._id === optimisticMsg._id ? saved : m));
            saveStoredLocalMessages(currentUserId, contactId, replaced);
            return replaced;
          });
        }
        loadRoomsWithoutReset();
      }
    } catch (err) {
      console.warn('Backend message save note: message safely persisted in local session:', err.message);
    }
  };

  const loadRoomsWithoutReset = async () => {
    try {
      const data = await apiRequest('/chats/rooms');
      if (data && data.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      }
    } catch (err) {}
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const activeId = activeContactRef.current?._id || activeContactRef.current?.id;
      const tasks = [loadRooms()];
      if (activeId) {
        tasks.push(loadMessages(activeId));
      }
      await Promise.all(tasks);
      toast.success('Chat refreshed', { id: 'chat-refresh' });
    } catch (err) {
      toast.error('Could not refresh chat', { id: 'chat-refresh' });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 400);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-beige pb-4 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">💬 DISCUSSION CENTER</span>
          <h1 className="font-serif text-xl md:text-2xl text-primary font-medium mt-1">Direct Messaging</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/pets"
            className="text-xs text-gray-500 hover:text-primary transition font-medium hidden sm:inline"
          >
            ← Back to Pet Classifieds
          </Link>
          <button 
            id="chat-refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 border border-beige hover:border-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition rounded-md bg-white shadow-sm cursor-pointer disabled:opacity-60 active:scale-95"
            title="Refresh conversations and messages"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-accent' : ''} /> 
            {isRefreshing ? 'REFRESHING...' : 'REFRESH'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 border border-beige bg-white h-[650px] max-h-[75vh] min-h-[480px] shadow-sm overflow-hidden rounded-xl">
        
        {/* SIDEBAR: CONTACT ROOMS (Left 4 columns) */}
        <aside className={`md:col-span-4 border-r border-beige flex flex-col h-full min-h-0 overflow-hidden bg-white ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="shrink-0 bg-[#FAF9F5] p-4 border-b border-beige text-xs font-bold text-primary uppercase tracking-wider flex justify-between items-center">
            <span>Active Chats</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{rooms.length}</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-beige">
            {loadingRooms && rooms.length === 0 ? (
              <p className="p-4 text-xs text-gray-400 text-center">Loading conversation channels...</p>
            ) : rooms.length > 0 ? (
              rooms.map((contact) => {
                const contactId = (contact._id || contact.id || '').toString();
                const isActive = (activeContact?._id || activeContact?.id || '').toString() === contactId;

                return (
                  <button
                    key={contactId || contact.name}
                    onClick={() => handleSelectContact(contact)}
                    className={`w-full text-left p-3.5 sm:p-4 text-xs transition flex items-center gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-[#FAF9F5] border-l-4 border-primary font-bold text-primary' 
                        : 'text-gray-600 hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-primary/20">
                      {contact.name ? contact.name[0] : 'P'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-bold truncate text-primary text-xs">{contact.name}</p>
                        {contact.lastMessageTime && (
                          <span className="text-[9px] text-gray-400 shrink-0">
                            {new Date(contact.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {contact.lastMessage || contact.listingTitle || 'Click to view correspondence'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-3">
                <MessageSquare size={28} className="text-gray-300 mx-auto" />
                <p className="text-xs text-gray-400 italic">No previous chats. Click &quot;CHAT&quot; on any pet classified listing to start a conversation.</p>
                <Link
                  to="/pets"
                  className="inline-block mt-2 px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-accent hover:text-primary transition"
                >
                  Browse Pets
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* CHAT MESSAGES WINDOW (Right 8 columns) */}
        <section className={`md:col-span-8 flex flex-col h-full min-h-0 overflow-hidden bg-white relative ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {activeContact ? (
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
              
              {/* Top Contact Header */}
              <div className="shrink-0 bg-[#FAF9F5] p-3.5 sm:p-4 border-b border-beige flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button 
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1 text-gray-500 hover:text-primary"
                    aria-label="Back to contacts"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase shadow-sm">
                    {activeContact.name ? activeContact.name[0] : 'S'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-primary text-xs sm:text-sm truncate">{activeContact.name}</h3>
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" title="Verified Pet Seller" />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online & Available
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {listingContext?.title && (
                    <span className="hidden sm:inline-block text-[10px] bg-white border border-beige px-2.5 py-1 rounded-full text-gray-600 truncate max-w-[200px]">
                      Listing: {listingContext.title}
                    </span>
                  )}
                  <button 
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 text-gray-500 hover:text-primary transition rounded hover:bg-white/80 cursor-pointer disabled:opacity-50"
                    title="Refresh conversation messages"
                    aria-label="Refresh conversation"
                  >
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-accent' : ''} />
                  </button>
                </div>
              </div>

              {/* Inquiry Pet Header Banner (if redirected from or viewing a listing) */}
              {listingContext && (
                <div className="bg-[#fcfaf5] border-b border-[#e9dfcd] p-3 sm:px-4 flex items-center justify-between gap-3 text-xs shrink-0 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    {listingContext.image && (
                      <img 
                        src={listingContext.image} 
                        alt="" 
                        className="w-11 h-11 rounded-lg object-cover border border-beige shrink-0 shadow-sm" 
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-primary truncate text-xs">{listingContext.title}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {listingContext.breed ? <span className="font-semibold">{listingContext.breed} • </span> : ''}
                        <span className="text-primary font-black">₹{Number(listingContext.price || 0).toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewMessage(`Hi, I am interested in ${listingContext.title}. Is this pet still available?`);
                      setTimeout(() => inputRef.current?.focus(), 10);
                    }}
                    className="px-3 py-1.5 bg-[#ffd000] hover:bg-[#e6bb00] text-[#0F2E23] text-[11px] font-black rounded-lg transition shrink-0 cursor-pointer shadow-sm"
                  >
                    Ask Availability
                  </button>
                </div>
              )}

              {/* Scrolling messages list */}
              <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#FAFBF9]">
                {loadingMessages && messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">Fetching correspondence history...</p>
                ) : messages.length > 0 ? (
                  messages.map((m, index) => {
                    const myId = (user?._id || user?.id || '').toString();
                    const myEmail = (user?.email || '').toLowerCase().trim();
                    const myName = (user?.name || '').trim().toLowerCase();

                    const msgSenderId = (m.sender?._id || m.sender?.id || (typeof m.sender === 'string' ? m.sender : '') || '').toString();
                    const msgSenderEmail = (m.sender?.email || '').toLowerCase().trim();
                    const msgSenderName = (m.sender?.name || (typeof m.sender === 'string' ? m.sender : '') || '').trim().toLowerCase();

                    const contactId = (activeContact?._id || activeContact?.id || '').toString();
                    const contactEmail = (activeContact?.email || '').toLowerCase().trim();
                    const contactName = (activeContact?.name || '').trim().toLowerCase();

                    const recipientId = (m.recipient?._id || m.recipient?.id || (typeof m.recipient === 'string' ? m.recipient : '') || '').toString();

                    let isMe = false;
                    if (myId && msgSenderId && myId === msgSenderId) {
                      isMe = true;
                    } else if (myEmail && msgSenderEmail && myEmail === msgSenderEmail) {
                      isMe = true;
                    } else if (contactId && msgSenderId && contactId === msgSenderId) {
                      isMe = false;
                    } else if (contactEmail && msgSenderEmail && contactEmail === msgSenderEmail) {
                      isMe = false;
                    } else if (contactName && msgSenderName && contactName === msgSenderName) {
                      isMe = false;
                    } else if (myName && msgSenderName && myName === msgSenderName) {
                      isMe = true;
                    } else if (contactId && recipientId && contactId === recipientId) {
                      isMe = true;
                    } else if (myId && recipientId && myId === recipientId) {
                      isMe = false;
                    } else {
                      isMe = msgSenderId ? msgSenderId === myId : false;
                    }

                    return (
                      <div 
                        key={m._id || index} 
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                      >
                        <div 
                          className={`max-w-[85%] sm:max-w-md p-3 sm:p-3.5 text-xs shadow-sm rounded-2xl ${
                            isMe 
                              ? 'bg-primary text-white rounded-br-xs ml-auto shadow-md' 
                              : 'bg-white text-gray-800 border border-beige rounded-bl-xs mr-auto'
                          }`}
                        >
                          {/* Attached listing snippet if message has listing reference */}
                          {(m.listingTitle || m.listingImage) && (
                            <div className={`mb-2 p-2 rounded-xl flex items-center gap-2 text-[11px] border ${
                              isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-secondary border-beige text-primary'
                            }`}>
                              {m.listingImage && (
                                <img src={m.listingImage} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" />
                              )}
                              <span className="font-bold truncate">{m.listingTitle || 'Pet Inquiry'}</span>
                            </div>
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap">{m.messageText}</p>
                          <span className={`block text-[9px] text-right mt-1.5 font-medium ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <Sparkles size={20} />
                    </div>
                    <h4 className="font-serif text-sm font-bold text-primary">Start Conversation with {activeContact.name}</h4>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Send a message below to inquire about vaccinations, adoption process, or schedule an in-person pet meeting.
                    </p>
                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-md mx-auto">
                      {[
                        'Is this pet still available?',
                        'Can I see vaccination certificate?',
                        'Can we arrange a video call?'
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            setNewMessage(prompt);
                            setTimeout(() => inputRef.current?.focus(), 10);
                          }}
                          className="text-[11px] px-3 py-1 bg-white hover:bg-beige border border-beige rounded-full text-gray-700 transition cursor-pointer shadow-2xs"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input text message box */}
              <form onSubmit={handleSendMessage} className="shrink-0 p-3 sm:p-4 border-t border-beige bg-white flex items-center gap-2 z-10">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Message ${activeContact.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow px-4 py-2.5 border border-beige rounded-xl text-xs focus:outline-none focus:border-primary bg-[#FAF9F5] shadow-inner"
                  required
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 py-2.5 bg-primary text-white hover:bg-accent hover:text-primary transition cursor-pointer rounded-xl flex items-center justify-center shrink-0 font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  title="Send Message"
                >
                  <Send size={15} />
                </button>
              </form>

            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center p-8 space-y-3">
              <MessageSquare size={36} className="text-gray-300" />
              <h3 className="font-serif text-sm font-semibold text-primary">No Active Conversation Selected</h3>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Select an active contact from the sidebar or click &quot;CHAT&quot; on any pet classified listing to initiate direct communication.
              </p>
              <Link
                to="/pets"
                className="mt-3 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-accent hover:text-primary transition"
              >
                Browse Pet Classifieds
              </Link>
            </div>
          )}
        </section>

      </div>

    </div>
  );
};

export default ChatConsole;
