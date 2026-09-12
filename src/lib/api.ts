import { Message, KowiResponse, ConversationState } from '@/types';

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
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        response: data.response,
        goal: data.goal,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}