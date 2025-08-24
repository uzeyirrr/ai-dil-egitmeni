import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGoogleAIToken = async () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing required environment variable (GOOGLE_AI_API_KEY)');
  }

  return apiKey;
};

export const createGoogleAIModel = async () => {
  const apiKey = await getGoogleAIToken();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" }); // Real-time stream için yeni model
};
