import type { Config, Context } from '@netlify/edge-functions'

const notionDatabaseId = Netlify.env.get('NOTION_DATABASE_ID')
const notionApiKey = Netlify.env.get('NOTION_API_KEY')
const thisApiPath = Netlify.env.get('REACT_APP_LEADS_API_URL')

export default async (req: Request, context: Context) => {
  const { email, referrer } = await req.json()

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      'parent': { 'type': 'database_id', 'database_id': notionDatabaseId },
      'properties': {
        'email': {
          'title': [{ 'text': { 'content': email } }],
        },
        'referrer': {
          'rich_text': [{ 'text': { 'content': req.referrer ?? referrer ?? '' } }],
        },
      },
    }),
  })

  if (response.status < 200 || response.status >= 300) {
    console.log('Error with', email)
    throw new Error('💥s')
  }

  return new Response(JSON.stringify({ status: 'success' }))
}

export const config: Config = { path: thisApiPath, method: ['POST'] }
