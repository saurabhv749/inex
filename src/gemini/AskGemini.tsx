import './styles.css';
import { useEffect, useRef, useState } from 'react';

import { FinanceData } from '../models';
import ModalShell from '../components/ModalShell';
import { useModal } from '../context/ModalContext';

import CodeAgent from './engine';
import { Message } from './engine';

interface AskGeminiProps {
    data: FinanceData;
    currency: string;
    accountNames: string[];
    categoryNames: string[];
}

const QueryHints = [
    "Which three micro-expenses (under $10 / ₹1,000) are quietly consuming the largest share of my monthly budget?",
    "What percentage of my total monthly outflow goes to food delivery or dining out versus buying groceries to cook at home?",
    "How long does my primary salary or income source typically last before my account balance dips below a safety threshold?"
]

function AskGemini({ data, currency, accountNames, categoryNames }: AskGeminiProps) {
    const { closeModal } = useModal();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [agent] = useState(() => new CodeAgent());
    const [isRunning, setIsRunning] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const today = new Date().toLocaleDateString('en-Us', { day: '2-digit', month: 'long', year: 'numeric' })
    const userDataInfo = `Today is ${today}\nAvailable accounts: ${accountNames}\nAvailable categories: ${categoryNames}\nCurrency in use: ${currency}`

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let trimmedMessage = message.trim();

        if (!trimmedMessage || isRunning) {
            return;
        }

        setIsRunning(true);
        setMessages((currentMessages) => [
            ...currentMessages,
            { role: 'user', content: trimmedMessage },
        ]);
        setMessage('');

        try {
            const prompt = `${userDataInfo}\n\n${trimmedMessage}`
            const assistantReply = await agent.run(prompt, data);
            // agent.showMemory() // debug

            setMessages((currentMessages) => [
                ...currentMessages,
                { role: 'assistant', content: assistantReply },
            ]);

        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessages([]);
        setMessage('');
        agent.reset()
    };

    return (
        <ModalShell title="AI assistant" onClose={closeModal}>
            <div className="gemini-chat">
                <div className="gemini-messages" aria-live="polite">
                    {messages.length === 0 ? (
                        <div className="gemini-empty">
                            <p>
                                <em>
                                    Ask something about your finances.
                                </em>
                            </p>
                            {QueryHints.map((hint, i) => <span className='query-chip' key={`hint-${i}`}
                                onClick={() => setMessage(hint)}
                            >
                                {hint}
                            </span>)}
                        </div>
                    ) : (
                        messages.map((item, index) => (
                            <div className={`gemini-message gemini-message-${item.role}`} key={`${item.role}-${index}`}>
                                <span className="gemini-message-label">{item.role === 'user' ? 'You' : 'Assistant'}</span>
                                <p>{item.content}</p>
                            </div>
                        ))
                    )}
                    {
                        isRunning && <div className='gemini-message'><p>Generating....</p></div>
                    }
                    <div ref={messagesEndRef} />
                </div>

                <form className="gemini-composer"
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                >
                    <label className="gemini-input-label" htmlFor="user-message">Message</label>
                    <div className="gemini-composer-row">
                        <input
                            autoFocus
                            id="user-message"
                            name="user-message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Write a message..."
                            autoComplete='off'
                        />
                        <button className='button button-primary' type="submit" disabled={isRunning}>Send</button>
                        <button type="reset" className='button text-button gemini-new-conversation' disabled={isRunning}>Clear</button>
                    </div>
                </form>
            </div>
            <footer className='privacy-notice'>Powered by Gemini. Execution logs and print outputs are sent to Gemini to generate insights.</footer>
        </ModalShell>
    );
}

export default AskGemini;