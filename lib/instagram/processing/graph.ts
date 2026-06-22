import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  InstagramPostRow,
  ProcessingGraphState,
} from '@/lib/instagram/types'
import {
  downloadInstagramImage,
  uploadInstagramEventImage,
} from '@/lib/instagram/processing/image-storage'
import { buildVisionMessage } from '@/lib/instagram/processing/messages'
import { getVisionModel } from '@/lib/instagram/processing/openrouter'
import {
  buildClassificationPrompt,
  buildExtractionPrompt,
} from '@/lib/instagram/processing/prompts'
import { markPostSkipped } from '@/lib/instagram/processing/posts-repository'
import {
  buildInstagramEventKey,
  classificationSchema,
  extractedEventsSchema,
  validateExtractedEvents,
} from '@/lib/instagram/processing/schemas'

const GraphState = Annotation.Root({
  post: Annotation<InstagramPostRow>,
  classification: Annotation<ProcessingGraphState['classification']>({
    reducer: (_, value) => value,
    default: () => null,
  }),
  extractedEvents: Annotation<ProcessingGraphState['extractedEvents']>({
    reducer: (_, value) => value,
    default: () => null,
  }),
  skipReason: Annotation<ProcessingGraphState['skipReason']>({
    reducer: (_, value) => value,
    default: () => null,
  }),
  eventIds: Annotation<ProcessingGraphState['eventIds']>({
    reducer: (_, value) => value,
    default: () => [],
  }),
  llmResult: Annotation<ProcessingGraphState['llmResult']>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({}),
  }),
  error: Annotation<ProcessingGraphState['error']>({
    reducer: (_, value) => value,
    default: () => null,
  }),
})

async function classifyNode(state: typeof GraphState.State) {
  if (!state.post.image_url) {
    return {
      skipReason: 'No image available to analyze.',
      llmResult: { skipReason: 'No image available to analyze.' },
    }
  }

  const model = getVisionModel().withStructuredOutput(classificationSchema)
  const classification = await model.invoke([
    buildVisionMessage(
      buildClassificationPrompt(state.post),
      state.post.image_url
    ),
  ])

  return {
    classification,
    llmResult: { classification },
  }
}

async function extractNode(state: typeof GraphState.State) {
  if (!state.post.image_url) {
    throw new Error('No image available to analyze.')
  }

  const model = getVisionModel().withStructuredOutput(extractedEventsSchema)
  const extracted = await model.invoke([
    buildVisionMessage(buildExtractionPrompt(state.post), state.post.image_url),
  ])

  return {
    extractedEvents: extracted.events,
    llmResult: { extraction: extracted },
  }
}

async function validateNode(state: typeof GraphState.State) {
  if (!state.extractedEvents || state.extractedEvents.length === 0) {
    throw new Error('Missing extracted event data.')
  }

  const validation = validateExtractedEvents(state.extractedEvents)

  if (validation.status === 'skip') {
    return {
      skipReason: validation.reason,
      llmResult: {
        skipReason: validation.reason,
        extraction: state.extractedEvents,
      },
    }
  }

  return {
    extractedEvents: validation.data,
    llmResult: { validated: validation.data },
  }
}

function routeAfterClassify(state: typeof GraphState.State) {
  if (state.skipReason) {
    return 'markSkipped'
  }

  if (state.classification?.isEvent) {
    return 'extract'
  }

  return 'markSkipped'
}

function routeAfterValidate(state: typeof GraphState.State) {
  if (state.skipReason) {
    return 'markSkipped'
  }

  return 'save'
}

async function saveNode(state: typeof GraphState.State) {
  if (!state.extractedEvents || state.extractedEvents.length === 0) {
    throw new Error('Missing extracted event data.')
  }

  const supabase = createAdminClient()
  let imageUrl: string | null = null

  if (state.post.image_url) {
    const { buffer, contentType } = await downloadInstagramImage(
      state.post.image_url
    )
    imageUrl = await uploadInstagramEventImage(
      supabase,
      state.post.post_id,
      buffer,
      contentType
    )
  }

  const eventIds: string[] = []

  for (const extracted of state.extractedEvents) {
    const startsAt = new Date(extracted.starts_at)
    const instagramPostKey = buildInstagramEventKey(
      state.post.post_id,
      startsAt,
      extracted.title
    )

    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('instagram_post_id', instagramPostKey)
      .maybeSingle()

    if (existingEvent) {
      eventIds.push(existingEvent.id)
      continue
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: null,
        source: 'instagram',
        instagram_post_id: instagramPostKey,
        title: extracted.title.trim(),
        description: extracted.description.trim(),
        location: extracted.location.trim(),
        starts_at: startsAt.toISOString(),
        ends_at: extracted.ends_at
          ? new Date(extracted.ends_at).toISOString()
          : null,
        time_tbc: extracted.time_tbc,
        is_free: extracted.is_free,
        price_php: extracted.is_free ? null : extracted.price_php,
        image_url: imageUrl,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`)
    }

    eventIds.push(event.id)
  }

  return {
    eventIds,
    llmResult: { eventIds, imageUrl },
  }
}

async function markSkippedNode(state: typeof GraphState.State) {
  await markPostSkipped(state.post.post_id, state.llmResult)

  return {}
}

const workflow = new StateGraph(GraphState)
  .addNode('classify', classifyNode)
  .addNode('extract', extractNode)
  .addNode('validate', validateNode)
  .addNode('save', saveNode)
  .addNode('markSkipped', markSkippedNode)
  .addEdge(START, 'classify')
  .addConditionalEdges('classify', routeAfterClassify, {
    extract: 'extract',
    markSkipped: 'markSkipped',
  })
  .addEdge('extract', 'validate')
  .addConditionalEdges('validate', routeAfterValidate, {
    save: 'save',
    markSkipped: 'markSkipped',
  })
  .addEdge('save', END)
  .addEdge('markSkipped', END)

export const instagramProcessingGraph = workflow.compile()
