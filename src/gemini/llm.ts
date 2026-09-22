import { Message } from "./engine";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

let GEMINI_API_KEY = null
function getAPIKey() {
    GEMINI_API_KEY = localStorage.getItem('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
        const res = prompt('GEMINI_API_KEY is not set, please provide one.')
        if (res?.length) {
            localStorage.setItem('GEMINI_API_KEY', res)
            GEMINI_API_KEY = res
            alert('✅ GEMINI API Key updated.')
        }
    }
    return GEMINI_API_KEY
}

export async function chatCompletion(messages: Message[]): Promise<string> {

    const response = await fetch(GEMINI_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAPIKey()}`,
        },
        body: JSON.stringify({
            model: GEMINI_MODEL,
            messages,
            stream: false
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    // console.log("Token Usage:\n", data?.usage); // debug

    if (typeof content !== "string") {
        return "";
    }

    return content;
}
