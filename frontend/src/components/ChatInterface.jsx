import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hello! I am your AI accounting assistant. Upload an invoice and ask me questions about it.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');

        // 1. Add User's message to UI instantly
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // 2. Send POST request to backend
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get answer');
            }

            const data = await response.json();

            // 3. Append AI response to UI
            setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [
                ...prev,
                { role: 'error', content: `Error: ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>

            {/* Chat Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : msg.role === 'error' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'
                        }}>
                            {msg.role === 'user' ? <User size={20} /> : msg.role === 'error' ? <AlertCircle size={20} /> : <Bot size={20} />}
                        </div>

                        {/* Message Bubble */}
                        <div style={{
                            maxWidth: '80%',
                            padding: '1rem',
                            borderRadius: '16px',
                            backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : msg.role === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--glass-bg)',
                            border: msg.role === 'user' ? 'none' : msg.role === 'error' ? '1px solid #ef4444' : '1px solid var(--glass-border)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            color: 'white',
                            whiteSpace: 'pre-wrap', // Preserves newlines in the AI's response
                            lineHeight: '1.5'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <Bot size={20} />
                        </div>
                        <div style={{ padding: '1rem', borderRadius: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                            <div className="loader" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
                        </div>
                    </div>
                )}

                {/* Invisible div to scroll to */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form Area */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your invoice..."
                    disabled={isLoading}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: 'white',
                        outline: 'none',
                        fontSize: '1rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    style={{
                        padding: '0 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                        opacity: (!input.trim() || isLoading) ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
