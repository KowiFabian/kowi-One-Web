import { Message, KowiResponse } from '@/types';

export async function kowiChat(
  userMessage: string,
  messageHistory: Message[],
  conversationId: string
): Promise<KowiResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        messageHistory: messageHistory.map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        conversationId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();

      console.error('API Error Response:', error);

      return {
        success: false,
        error: error.error || error.message || 'Error desconocido',
      };
    }

    const data = await response.json();

    console.log('API Success Response:', data);

    return {
      success: true,
      data: {
        response: data.response,
        goal: data.goal,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error de conexión';

    console.error('Chat API Error:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
