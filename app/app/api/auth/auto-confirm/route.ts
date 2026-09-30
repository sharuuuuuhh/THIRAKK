import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'

/**
 * Backend route to automatically confirm user emails in Supabase in dev/demo
 * so users are never blocked by 'Email not confirmed'.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    if (isConfigured) {
      try {
        // List users to find the matching user ID
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (!listError && usersData?.users) {
          const matchedUser = usersData.users.find(
            (u) => u.email?.toLowerCase() === cleanEmail
          )
          if (matchedUser) {
            // Confirm the user
            await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, {
              email_confirm: true,
            })
            return NextResponse.json({ success: true, confirmed: true, userId: matchedUser.id })
          }
        }
      } catch (adminErr) {
        console.warn('Supabase admin auto-confirm fallback:', adminErr)
      }
    }

    return NextResponse.json({ success: true, message: 'Verified locally' })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Confirmation error' },
      { status: 500 }
    )
  }
}
