import { Client } from "@notionhq/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { video, config } = await req.json()

    if (!config.apiKey || !config.databaseId) {
      return NextResponse.json({ error: "Configuración de Notion incompleta" }, { status: 400 })
    }

    const notion = new Client({ auth: config.apiKey })

    // Build properties based on available data
    const properties: any = {
      "Name": {
        title: [
          {
            text: {
              content: video.notion_title || video.title,
            },
          },
        ],
      },
      "URL": {
        url: video.url,
      },
      "Type": {
        select: {
          name: video.type === 'video' ? 'Vídeo' : 'Web',
        },
      },
    }

    if (video.channel_name) {
      properties["Channel"] = {
        select: {
          name: video.channel_name,
        },
      }
    }

    // Optional: add Category (Multi-select format is safer)
    if (video.notion_category) {
      properties["Category"] = {
        multi_select: [
          { name: video.notion_category }
        ],
      }
    }

    // Add Date
    if (video.notion_date) {
      properties["Date"] = {
        date: {
          start: video.notion_date,
        },
      }
    }

    const children: any[] = []

    // Add thumbnail if available
    if (video.thumbnail_url) {
      children.push({
        object: "block",
        type: "image",
        image: {
          type: "external",
          external: {
            url: video.thumbnail_url,
          },
        },
      })
    }

    // Helper to split long text into Notion-compliant chunks
    const splitText = (text: string) => {
      const chunks = []
      for (let i = 0; i < text.length; i += 2000) {
        chunks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: text.substring(i, i + 2000) } }],
          },
        })
      }
      return chunks
    }

    // Add Personal Note
    if (video.notion_personal_note || video.personal_notes) {
      children.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ text: { content: "Notas Personales" } }],
        },
      })
      children.push(...splitText(video.notion_personal_note || video.personal_notes))
    }

    // Add AI Summary
    if (video.ai_summary) {
      children.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ text: { content: "Resumen IA" } }],
        },
      })
      children.push(...splitText(video.ai_summary))
    }

    await notion.pages.create({
      parent: { database_id: config.databaseId },
      properties,
      children,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Notion Export Error:", error)
    return NextResponse.json({ error: error.message || "Error al exportar a Notion" }, { status: 500 })
  }
}
