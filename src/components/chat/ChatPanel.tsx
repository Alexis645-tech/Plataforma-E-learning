import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Send,
  Search,
  MessageSquare,
  User as UserIcon,
  CheckCheck,
  Smile,
  Paperclip,
  ArrowLeft
} from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { currentUser, users, chatMessages, sendChatMessage } = useApp();

  const [selectedContactId, setSelectedContactId] = useState<string>(() => {
    const otherUser = users.find((u) => u.id !== currentUser.id);
    return otherUser ? otherUser.id : '';
  });
  const [messageText, setMessageText] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [isMobileContactListOpen, setIsMobileContactListOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = users.filter((u) => u.id !== currentUser.id);
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const selectedContact = users.find((u) => u.id === selectedContactId) || contacts[0];

  // Conversation between currentUser and selectedContact
  const conversation = chatMessages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === selectedContactId) ||
      (m.senderId === selectedContactId && m.receiverId === currentUser.id)
  );

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.length, selectedContactId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContactId) return;

    sendChatMessage(selectedContactId, messageText.trim());
    setMessageText('');
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400';
      case 'teacher':
        return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400';
      case 'student':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden animate-in fade-in duration-150">
      <div className="flex-1 flex overflow-hidden">
        {/* Contact List Column */}
        <div className={`${selectedContact && !isMobileContactListOpen ? 'hidden md:flex' : 'flex'} w-full md:w-72 sm:md:w-80 border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50/50 dark:bg-slate-900/50`}>
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Mensajes Directos
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {contacts.length} contactos
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o rol..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredContacts.map((contact) => {
              const isSelected = contact.id === selectedContactId;
              const lastMsg = chatMessages
                .filter(
                  (m) =>
                    (m.senderId === currentUser.id && m.receiverId === contact.id) ||
                    (m.senderId === contact.id && m.receiverId === currentUser.id)
                )
                .slice(-1)[0];

              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContactId(contact.id);
                    setIsMobileContactListOpen(false);
                  }}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-2 border-indigo-600'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {contact.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${getRoleBadgeStyle(
                          contact.role
                        )}`}
                      >
                        {contact.role === 'admin' ? 'Admin' : contact.role === 'teacher' ? 'Docente' : 'Alumno'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.message : contact.bio || 'Iniciar conversación'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Messages Column */}
        {selectedContact ? (
          <div className={`${isMobileContactListOpen ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-slate-900`}>
            {/* Conversation Header */}
            <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsMobileContactListOpen(true)}
                  className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  title="Ver contactos"
                  aria-label="Ver lista de contactos"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {selectedContact.name}
                    </h3>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${getRoleBadgeStyle(
                        selectedContact.role
                      )}`}
                    >
                      {selectedContact.role === 'admin' ? 'Administrador' : selectedContact.role === 'teacher' ? 'Docente' : 'Estudiante'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedContact.department || selectedContact.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/40">
              {conversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
                  <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Comienza una conversación con {selectedContact.name}
                  </div>
                  <div className="text-[11px] mt-1 max-w-xs">
                    Pregunta sobre tareas pendientes, aclaración de clases o asesoría académica.
                  </div>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Escribe un mensaje para ${selectedContact.name.split(' ')[0]}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Selecciona un contacto para iniciar una conversación.
          </div>
        )}
      </div>
    </div>
  );
};
