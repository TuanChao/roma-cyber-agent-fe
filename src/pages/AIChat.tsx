import { useState, useRef, useEffect } from 'react';
import { Send, Loader, User } from 'lucide-react';
import toast from 'react-hot-toast';
import GeminiIcon from '../components/GeminiIcon';
import { chatWithAI } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m Roma, your AI security assistant powered by OpenAI GPT. Ask me anything about cybersecurity threats, incident analysis, or security best practices!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(input, messages.slice(-10));

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to get response');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'What is a DDoS attack?',
    'How to prevent SQL injection?',
    'Explain ransomware attacks',
    'Best practices for network security',
    'What is a zero-day vulnerability?',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <GeminiIcon size={48} className="animate-pulse" />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Roma AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Your intelligent cybersecurity advisor</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 border-2 border-[#ff6b6b] flex items-center justify-center">
                    <GeminiIcon size={20} />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#ff6b6b] text-white'
                    : 'bg-gray-100 dark:bg-gray-900/40 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 border-2 border-[#ff6b6b] flex items-center justify-center">
                  <GeminiIcon size={20} />
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900/40 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-900/30 hover:bg-gray-200 dark:hover:bg-gray-900/50 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors border border-gray-300 dark:border-gray-700/50 hover:border-indigo-400 dark:hover:border-gray-600"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Roma anything about cybersecurity..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b6b] resize-none"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#ff6b6b] hover:bg-[#ee5a6f] text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
