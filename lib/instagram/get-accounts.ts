import { createAdminClient } from '@/lib/supabase/admin'
import type { InstagramAccount } from '@/lib/instagram/types'

export async function getActiveInstagramAccounts(): Promise<InstagramAccount[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('instagram_accounts')
    .select('username, is_active, last_scraped_at, created_at')
    .eq('is_active', true)
    .order('username')

  if (error) {
    throw new Error(`Failed to load instagram_accounts: ${error.message}`)
  }

  return data ?? []
}
