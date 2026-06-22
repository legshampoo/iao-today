import { getInstagramScrapeConfig } from '@/lib/instagram/config'
import type { ApifyPostItem } from '@/lib/instagram/types'

type StartRunResult = {
  runId: string
  datasetId: string | null
}

function buildWebhookUrl(username: string): string {
  const { siteUrl, cronSecret } = getInstagramScrapeConfig()
  const params = new URLSearchParams({
    key: cronSecret,
    username,
  })

  return `${siteUrl}/api/webhooks/apify?${params.toString()}`
}

function buildAdHocWebhooksParam(requestUrl: string): string {
  const webhooks = [
    {
      eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
      requestUrl,
    },
  ]

  return Buffer.from(JSON.stringify(webhooks)).toString('base64')
}

export async function startInstagramProfileScrape(
  username: string
): Promise<StartRunResult> {
  const { apifyToken, actorId, postsLimit } = getInstagramScrapeConfig()
  const webhookUrl = buildWebhookUrl(username)
  const webhooks = buildAdHocWebhooksParam(webhookUrl)

  const url = new URL(`https://api.apify.com/v2/acts/${actorId}/runs`)
  url.searchParams.set('token', apifyToken)
  url.searchParams.set('webhooks', webhooks)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resultsType: 'posts',
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsLimit: postsLimit,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Apify run failed for @${username} (${response.status}): ${body}`
    )
  }

  const payload = (await response.json()) as {
    data?: { id?: string; defaultDatasetId?: string }
  }

  const runId = payload.data?.id

  if (!runId) {
    throw new Error(`Apify run for @${username} did not return a run id.`)
  }

  return {
    runId,
    datasetId: payload.data?.defaultDatasetId ?? null,
  }
}

export async function fetchApifyDatasetItems(
  datasetId: string
): Promise<ApifyPostItem[]> {
  const { apifyToken } = getInstagramScrapeConfig()

  const url = new URL(`https://api.apify.com/v2/datasets/${datasetId}/items`)
  url.searchParams.set('token', apifyToken)

  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Failed to fetch Apify dataset ${datasetId} (${response.status}): ${body}`
    )
  }

  return (await response.json()) as ApifyPostItem[]
}
