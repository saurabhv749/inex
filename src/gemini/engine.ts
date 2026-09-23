import { FinanceData } from "../models";
import { chatCompletion } from "./llm";
import { FINAL_ANSWER_TAGS, SYSTEM_PROMPT, ACTIONS_PROMPT } from "./prompts";

// TYPES
interface BaseMessage<TRole extends string> {
    role: TRole;
    content: string;
}
type Roles = 'system' | 'user' | 'assistant' | 'code' | 'observation' | 'answer';
type LogRoles = Extract<Roles, 'user' | 'code' | 'observation' | 'answer'>;

type LogMessage = BaseMessage<LogRoles>;
type Message = BaseMessage<Roles>;

// UTILS
const normalizeTags = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.filter((tag): tag is string => typeof tag === 'string' && !!tag.trim());
    }

    if (typeof value === 'string' && value.trim()) {
        return [value];
    }

    return [];
};

const extractCodeSnippet = (text: string): string | null => {
    const codeRegex = /<code>([\s\S]*?)<\/code>/i;
    const match = text.match(codeRegex);
    return match ? match[1] : null;
}

function extractAnswer(rawText: string) {
    // Match everything between <answer> and </answer> (case-insensitive)
    const match = rawText.match(/<answer>([\s\S]*?)<\/answer>/i);
    if (match && match[1]) {
        return match[1].trim();
    }
    return rawText.trim();
}

const looksLikeFinalAnswer = (raw: string): boolean => {
    const normalized = raw.toLowerCase();
    const finalTags = [
        ...normalizeTags(FINAL_ANSWER_TAGS),
        'final answer',
        'final_answer',
        '<final>',
        '</final>',
        '<answer>',
        '</answer>'
    ];

    return finalTags.some((tag) => normalized.includes(tag.toLowerCase()));
};

function formatForLLM(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (value === null || value === undefined) {
        return String(value); // Returns "null" or "undefined"
    }

    if (value instanceof Error) {
        return value.stack || `${value.name}: ${value.message}`;
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return Object.prototype.toString.call(value);
    }
}

function _sanitizeCode(code: string) {
    // Replace non-breaking spaces and invisible characters with standard space
    return code
        .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
        .trim();
}

function executeUserQuery(financeData: FinanceData, codeString: string) {
    let cleanCode = codeString.replace(/```(?:javascript|js|typescript|ts)?/gi, '').replace(/```/g, '').trim();
    //Clean LLM code output of hidden Unicode characters
    cleanCode = _sanitizeCode(cleanCode)
    if (!cleanCode.length) {
        return null;
    }
    // override native Console
    const logs: any[] = [];
    const customConsole = {
        log: (...args: any[]) => logs.push(args.map(a => formatForLLM(a)).join(' ')),
        error: (...args: any[]) => logs.push('[ERROR] ' + args.map(a => formatForLLM(a)).join(' ')),
        warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => formatForLLM(a)).join(' ')),
        info: (...args: any[]) => logs.push('[INFO] ' + args.map(a => formatForLLM(a)).join(' '))
    };

    try {
        const fn = Object.getPrototypeOf(function () { }).constructor;
        const queryFn = new fn("console", 'financeData', cleanCode);
        const result = queryFn(customConsole, financeData);

        let output = "Execution Logs:\n" + logs.join('\n');
        if (result !== undefined) {
            // if codeblock has a return statement
            const formattedResult = `[Return Value]: ${formatForLLM(result)}`;
            output = output ? `${output}\n${formattedResult}` : formattedResult;
        }
        return output.trim()
    } catch (err: any) {
        let output = logs.join('\n');
        const errorMsg = `[Runtime Error]: ${err.name} - ${err.message} || ''}`;
        return output ? `${output}\n\n${errorMsg}` : errorMsg
    }
}

const logByRole = ({ content, role }: LogMessage) => {
    const roleStyles: Record<LogRoles, { badge: string; text: string }> = {
        user: {
            badge: "background: #007bff; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
            text: "color: #0056b3;"
        },
        code: {
            badge: "background: #6f42c1; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
            text: "color: #5a32a3;"
        },
        observation: {
            badge: "background: #fd7e14; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
            text: "color: #d96500;"
        },
        answer: {
            badge: "background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
            text: "color: #1e7e34;"
        }
    };

    const { badge, text } = roleStyles[role];
    const label = role.toUpperCase();

    // Log with formatting
    console.log(`%c ${label} %c \n${content}`, badge, text);
};

// CLASSES
class AgentMemory {
    private messages: Message[] = [];

    add(role: Roles, content: string) {
        this.messages.push({ role, content: String(content) });
    }

    toMessages(): Message[] {
        const messages = this.messages.filter((m, i) => (m.role !== 'code' && m.role !== 'answer' && m.role !== 'observation') || (m.role === 'observation' && i === this.messages.length - 1))
        // manage context:
        // add last observation as a user message, remove rest of the code snippets
        return messages.map((msg, index) => {
            if (msg.role === 'observation') {
                return { role: 'user' as Roles, content: msg.content };
            }
            return msg;
        });
    }

    async summarize() {
        const msgs = this.messages.filter(m => (
            m.role === 'user' || m.role === 'observation' || m.role === "answer")
        )
        const actionLogs = msgs.map(msg => {
            return msg.role === 'user' ? `[User]:\n${msg.content}` : msg.content
        })
        const messages: Message[] = [
            { role: 'system', content: ACTIONS_PROMPT },
            { role: 'user', content: actionLogs.join('\n\n') }
        ]

        const summary = await chatCompletion(messages);
        return summary
    }

    print() {
        this.messages.forEach(message => {
            if (message.role !== 'system' && message.role !== 'assistant') {
                logByRole(message as LogMessage)
            }
        })
    }

    clearMessages() {
        this.messages = [];
    }
}

class CodeAgent {
    private memory: AgentMemory;

    constructor() {
        this.memory = new AgentMemory();
        this.memory.add('system', SYSTEM_PROMPT);
    }

    reset() {
        this.memory.clearMessages()
        this.memory.add('system', SYSTEM_PROMPT);
    }

    showMemory() {
        this.memory.print()
    }

    async summarize() {
        const stepsSummary = await this.memory.summarize()
        return stepsSummary
    }

    async run(userQuery: string, financeData?: FinanceData): Promise<string> {
        const data = financeData;
        if (!data) {
            return 'No financeData provided to the agent.';
        }
        this.memory.add('user', userQuery);

        const maxSteps = 10;
        let lastObservation: string | null = null;

        for (let step = 0; step < maxSteps; step += 1) {
            const messages = this.memory.toMessages();
            const llmText = await chatCompletion(messages);
            this.memory.add('assistant', llmText); // reasoning + ?code snippet + ?final answer

            const codeSnippet = extractCodeSnippet(llmText);
            if (codeSnippet) {
                this.memory.add('code', `[Code Snippet]:\n${codeSnippet}`)
                const result = executeUserQuery(data, codeSnippet);
                const observation = formatForLLM(result);
                lastObservation = observation;
                this.memory.add('observation', `[Observation]:\n${observation}`);

                if (looksLikeFinalAnswer(llmText)) {
                    this.memory.add('answer', `[Answer]:\n${extractAnswer(observation)}`);
                    return extractAnswer(observation);
                }

                continue; // let the model reason about the observations
            }

            if (looksLikeFinalAnswer(llmText)) {
                this.memory.add('answer', `[Answer]:\n${extractAnswer(llmText)}`);
                return extractAnswer(llmText);
            }

            if (step === maxSteps - 1) {
                console.error('Max number of steps reached.');
                return lastObservation ?? 'The agent did not produce a valid result.';
            }
        }

        return lastObservation ?? 'The agent did not produce a valid result.';
    }
}
// EXPORTS
export { type Message }
export default CodeAgent