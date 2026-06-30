import { ChatOpenAI } from '@langchain/openai'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'openai/gpt-4o-mini'

export function getVisionModel(): ChatOpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is required for Instagram post processing.')
  }

  return new ChatOpenAI({
    model: MODEL,
    apiKey,
    temperature: 0,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siargaonow.com',
        'X-Title': 'Siargao Now',
      },
    },
  })
}
