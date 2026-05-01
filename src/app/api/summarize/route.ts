import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, channelName } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const prompt = `Eres un analista de contenido experto. Basándote en el título y canal, genera un análisis útil para decidir si vale la pena ver el vídeo y para usarlo como descripción en Notion.

Título: "${title}"
Canal: "${channelName || 'Desconocido'}"

Responde EXACTAMENTE con este formato en español:

💡 Puntos clave
• [Punto específico y concreto sobre un concepto, herramienta o idea que cubre el vídeo]
• [Otro punto específico - mínimo 6, máximo 8 puntos, cada uno con detalle real]
• [...]

⚡ Por qué verlo
[2-3 frases directas: qué ventaja concreta da verlo, qué aprenderás que no encuentras fácilmente, qué acción o decisión te permite tomar después de verlo.]

Sé muy específico. Extrae el máximo valor del título. Sin frases genéricas. Sin introducción.`

    // Models verified working - flash-lite is faster and more predictable for structured output
    const models = [
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
      'gemini-flash-latest',
    ]

    let lastError: any = null

    for (const model of models) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2000,
                thinkingConfig: { thinkingBudget: 0 },
              }
            })
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (summary) {
            return NextResponse.json({ summary, modelUsed: model })
          }
        } else {
          const errData = await geminiRes.json()
          lastError = errData
          console.error(`Model ${model} failed:`, JSON.stringify(errData))
          // If it's an auth error, no point trying other models
          if (geminiRes.status === 400 || geminiRes.status === 403) {
            return NextResponse.json({ 
              error: `Error de autenticación con Gemini (${geminiRes.status}). Comprueba que la clave es correcta y tiene la API activada en Google Cloud.`,
              details: errData
            }, { status: 500 })
          }
        }
      } catch (e) {
        lastError = e
        continue
      }
    }

    return NextResponse.json({ 
      error: 'No se pudo conectar con Gemini. Intenta reiniciar el servidor.',
      details: lastError
    }, { status: 500 })

  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
