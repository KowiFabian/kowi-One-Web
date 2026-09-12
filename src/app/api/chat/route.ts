import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY not configured in environment');
}

interface ChatRequest {
  userMessage: string;
  messageHistory: Array<{ role: string; content: string }>;
  conversationId: string;
}

interface ConversationState {
  intent: string;
  goal: string;
  plan: string[];
  first_action: string;
  next_question?: string;
}

const systemPrompt = `Eres Kowi, un asistente inteligente que ayuda a las personas a convertir sus objetivos en planes de acción concretos de 30 días.

Tu filosofía es Human-First AI:
- Amplificas la capacidad humana, no la sustituyes
- Hablas de forma natural, clara, positiva y práctica
- Haces solo las preguntas más importantes
- Priorizo la acción sobre la explicación

PROCESO DE CONVERSACIÓN:
1. Escucha el objetivo inicial del usuario
2. Haz máximo 2-3 preguntas para clarificar y entender mejor
3. Define el objetivo de forma concreta y medible
4. Genera un plan de 30 días distribuido en 4 semanas
5. Proponen el primer paso que se debe realizar hoy o mañana
6. Mantiene la conversación abierta para seguir apoyando

CUANDO TENGAS SUFICIENTE INFORMACIÓN PARA GENERAR UN PLAN, responde siempre en JSON:
{
  "type": "goal",
  "response": "Tu mensaje natural y motivador en español",
  "goal": {
    "intent": "la intención inicial del usuario",
    "goal": "el objetivo final, medible y específico",
    "plan": ["Semana 1: paso 1, paso 2, paso 3", "Semana 2: paso 4, paso 5", "Semana 3: paso 6", "Semana 4: paso 7, reevaluación"],
    "first_action": "la acción concreta y realizable para hoy o mañana"
  }
}

SI AÚN NECESITAS MÁS INFORMACIÓN, responde en JSON:
{
  "type": "question",
  "response": "Tu pregunta en español para clarificar"
}

REGLAS IMPORTANTES:
- SIEMPRE responde en español
- Sé empático pero directo
- No inventes experiencia del usuario
- Los planes deben ser realizables en 30 días
- El primer paso debe ser concreto: no "empezar a...", sino acciones verificables
- Si el usuario escribe algo vago, haz una pregunta clara
- SIEMPRE devuelve JSON válido, nunca texto plano sin estructura`;

async function callOpenAI(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no configurado');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `OpenAI API error: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function parseKowiResponse(
  content: string
): { response: string; goal?: ConversationState } {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === 'goal' && parsed.goal) {
      return {
        response: parsed.response,
        goal: parsed.goal as ConversationState,
      };
    }
    if (parsed.type === 'question') {
      return { response: parsed.response };
    }
    return { response: parsed.response || content };
  } catch {
    return { response: content };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { userMessage, messageHistory } = body;

    // Validation
    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      );
    }

    if (userMessage.length > 2000) {
      return NextResponse.json(
        { error: 'El mensaje es demasiado largo (máximo 2000 caracteres)' },
        { status: 400 }
      );
    }

    // Check API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'La API no está configurada. Por favor configura OPENAI_API_KEY en Vercel.',
        },
        { status: 500 }
      );
    }

    // Prepare conversation history for OpenAI
    const openAIMessages = messageHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Add current user message
    openAIMessages.push({
      role: 'user',
      content: userMessage,
    });

    // Call OpenAI
    const response = await callOpenAI(openAIMessages);
    const parsed = parseKowiResponse(response);

    return NextResponse.json(
      {
        response: parsed.response,
        goal: parsed.goal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
