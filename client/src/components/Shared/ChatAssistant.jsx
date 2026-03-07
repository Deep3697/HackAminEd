import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Bot } from 'lucide-react';

const Chatbot = ({ userRole }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to the bottom whenever messages or typing state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    
    setIsTyping(true);

    try {
      // POSTING TO YOUR BACKEND URL
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/ai/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput, 
          // THIS IS THE MAGIC LINE: Pass the actual role, default to 'user' if missing
          userRole: userRole || 'user' 
        }),
      });

      const data = await response.json();
      
      // Stop typing and show the message
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
      setIsTyping(false);

    } catch (error) {
      console.error("Frontend Error:", error);
      setMessages(prev => [...prev, { text: "I'm having trouble connecting. Is the server running?", sender: 'bot' }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* --- THE CUSTOM BRANDED TRIGGER BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#14213d] hover:bg-[#1e3a8a] text-[#fca311] p-4 rounded-full shadow-[0_4px_12px_rgba(20,33,61,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_8px_20px_rgba(252,163,17,0.4)]"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header - Updated with Deep Blue Gradient and Orange Accents */}
          <div className="bg-gradient-to-r from-[#14213d] to-[#1e3a8a] p-4 text-[#fca311] flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Bot size={20} className="text-[#fca311]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Telos Intelligence Hub</h3>
              <p className="text-xs text-gray-300 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online | AI Assistant
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#14213d] text-white rounded-tr-none' // User bubbles are Deep Blue
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator - Dots are now Orange */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-[#fca311] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#fca311] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#fca311] rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            {/* Scroll Anchor */}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 bg-gray-100 p-2 rounded-xl focus-within:ring-2 focus-within:ring-[#fca311]/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about stock, orders, or just say hi..."
                className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-700 placeholder:text-gray-400"
              />
              <button 
                onClick={handleSend} 
                className={`p-1 transition-colors ${input.trim() ? 'text-[#fca311] hover:text-[#dd8e04]' : 'text-gray-300'}`}
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;