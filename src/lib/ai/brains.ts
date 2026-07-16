/**
 * @fileOverview Groq AI Engine Utility
 * Interface sederhana untuk berinteraksi dengan API Groq menggunakan SDK resmi.
 */

import Groq from "groq-sdk";

// Inisialisasi klien Groq dengan API Key dari environment variable
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

/**
 * Daftar model Groq yang dipetakan ke brand STS
 */
export const GROQ_MODELS = {
  STS_LITE: "qwen/qwen-2.5-32b",
  STS_CORE: "llama-3.3-70b-versatile",
  STS_PRIME: "deepseek-r1-distill-llama-70b",
};

/**
 * Interface untuk pesan dalam chat
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Fungsi sederhana untuk bertanya satu kali (Single Prompt)
 */
export async function askBrain(prompt: string, model: string = GROQ_MODELS.STS_CORE) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: model,
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Brain Error:", error);
    throw new Error("Gagal mendapatkan respon dari AI Brain.");
  }
}

/**
 * Fungsi untuk percakapan chat (Multi-turn conversation)
 */
export async function chatWithBrain(messages: ChatMessage[], model: string = GROQ_MODELS.STS_CORE) {
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Brain Chat Error:", error);
    throw new Error("Gagal melanjutkan percakapan dengan AI Brain.");
  }
}

/**
 * Fungsi untuk percakapan chat dengan Streaming
 */
export async function chatWithBrainStream(messages: ChatMessage[], model: string = GROQ_MODELS.STS_CORE) {
  try {
    return await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
      stream: true,
    });
  } catch (error) {
    console.error("Groq Brain Stream Error:", error);
    throw new Error("Gagal memulai streaming dengan AI Brain.");
  }
}

/**
 * Fungsi untuk menghasilkan output terstruktur (JSON Mode)
 */
export async function askBrainStructured(prompt: string, model: string = GROQ_MODELS.STS_CORE) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: model,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Groq Brain Structured Error:", error);
    throw new Error("Gagal mendapatkan data terstruktur dari AI Brain.");
  }
}
