import { MessageSquare } from 'lucide-react';

const ChatInterface = () => {
    return (
        <div className="chat-placeholder">
            <MessageSquare className="chat-icon" />
            <p style={{ marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Chat Interface</p>
            <p style={{ marginTop: '0.5rem', maxWidth: '80%' }}>
                Upload a document first. Once processed, you can ask questions about its contents here.
            </p>
        </div>
    );
};

export default ChatInterface;
