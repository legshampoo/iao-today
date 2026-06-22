import type { InstagramPostRow } from '@/lib/instagram/types'

const MANILA_TZ = 'Asia/Manila'

export function buildClassificationPrompt(post: InstagramPostRow): string {
  const postedAt = post.post_timestamp ?? post.scraped_at

  return `You classify Instagram posts for IAO Today, a Siargao events board.

Account: @${post.account_username}
Posted at: ${postedAt} (${MANILA_TZ})
Caption:
${post.caption ?? '(no caption)'}

Carefully read the attached image. Many Siargao venue posts put the real event info in a weekly schedule or flyer image, not the caption.

Return isEvent=true when the post announces upcoming happenings in Siargao, including:
- a single dated event (party, workshop, market, class, gig, retreat, etc.)
- a weekly schedule or multi-day lineup shown in the image (even if the caption is generic)
- a venue posting its program for the current or coming week

Return isEvent=false for:
- generic venue promotion with no schedule or dates in the image
- thank-you / recap / "see you next time" posts
- lifestyle content with no upcoming program
- posts where the image and caption contain no upcoming dates or schedule

Respond with JSON only.`
}

export function buildExtractionPrompt(post: InstagramPostRow): string {
  const postedAt = post.post_timestamp ?? post.scraped_at
  const now = new Date().toLocaleString('en-PH', { timeZone: MANILA_TZ })

  return `Extract structured event data for IAO Today from this Instagram post.

Account: @${post.account_username}
Posted at: ${postedAt}
Current time in ${MANILA_TZ}: ${now}
Caption:
${post.caption ?? '(no caption)'}

Read the attached image carefully. This is the primary source for weekly schedules, daily lineups, dates, and event names.

Rules:
- Return one item in events[] per distinct upcoming occurrence listed
- A single day may have multiple events — create a separate item for each activity on that day
- If the image shows a weekly schedule (Mon–Sun or multiple days), extract each future day/activity as its own event
- Use the activity name from the image as the title (e.g. "Open Mic Night", "Sunset Sessions")
- If no time is shown for an event, set starts_at to YYYY-MM-DD only and time_tbc=true
- If a time is shown, set starts_at to full ISO 8601 with ${MANILA_TZ} offset (+08:00) and time_tbc=false
- Only include dates that are today or in the future relative to the current time above
- Default location to the venue/account name or "Siargao, Philippines" if unclear
- description should include what happens; do not invent a time when time_tbc=true
- is_free=true means no ticket price; otherwise set price_php as a number in Philippine pesos
- ends_at can be null if unknown
- For a single-event post, return one item in events[]

Respond with JSON only.`
}
