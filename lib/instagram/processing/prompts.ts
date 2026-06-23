import type { InstagramPostRow } from '@/lib/instagram/types'
import { formatManilaContext } from '@/lib/datetime/manila'

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
  const { dateKey, weekday, time } = formatManilaContext()

  return `Extract structured event data for IAO Today from this Instagram post.

Account: @${post.account_username}
Posted at: ${postedAt}
Today in Siargao (${MANILA_TZ}): ${dateKey} (${weekday})
Current time in Siargao: ${time}
Caption:
${post.caption ?? '(no caption)'}

Read the attached image carefully. This is the primary source for weekly schedules, daily lineups, dates, and event names.

All event dates and times are local to Siargao (${MANILA_TZ}, UTC+8). Never use UTC or a Z suffix.

Rules:
- Return one item in events[] per distinct upcoming occurrence listed
- A single day may have multiple events — create a separate item for each activity on that day
- If the image shows a weekly schedule (Mon–Sun or multiple days), extract each future day/activity as its own event
- Use the activity name from the image as the title (e.g. "Open Mic Night", "Sunset Sessions")
- If no time is shown for an event, set starts_at to YYYY-MM-DD only (e.g. ${dateKey}) and time_tbc=true
- If a time is shown, set starts_at to YYYY-MM-DDTHH:mm:ss+08:00 and time_tbc=false — example: ${dateKey}T18:00:00+08:00
- Only include dates that are today (${dateKey}) or later in Siargao
- Default location to the venue/account name or "Siargao, Philippines" if unclear
- description should include what happens; do not invent a time when time_tbc=true
- Pricing (read carefully from the image — captions often omit this):
  - Look for ₱ amounts, "PHP", "pesos", cover, door, entrance, drop-in, session, or class rates
  - Yoga, fitness, and workshop schedules often list a per-class price even on weekly grids
  - If a single drop-in rate applies to every class on the schedule, set that same price_php on each event
  - is_free=true only when the post explicitly says free / no cover / donation optional with no fixed price
  - If no price is shown anywhere, set is_free=false and price_php=null (do not assume free)
  - If any price is shown, set is_free=false and price_php to the numeric amount only (e.g. 350 not "₱350")
  - Mention the price in description too when it appears on the flyer
- ends_at can be null if unknown; if set, use the same +08:00 format
- For a single-event post, return one item in events[]

Respond with JSON only.`
}
