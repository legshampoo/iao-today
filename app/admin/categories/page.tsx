import { AdminShell } from '@/components/AdminShell'
import { CategoryManager } from '@/components/CategoryManager'
import { getListingCategories } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const categories = await getListingCategories(supabase)

  return (
    <AdminShell
      title="Categories"
      subtitle="Manage the category chips and labels used by listings."
    >
      <CategoryManager initialCategories={categories} />
    </AdminShell>
  )
}
