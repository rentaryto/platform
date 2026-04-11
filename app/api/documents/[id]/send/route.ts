import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { sendDocumentEmail } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    console.error('[SEND EMAIL] Unauthorized')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const result = await sendDocumentEmail({
      documentId: params.id,
      userId: user.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[SEND EMAIL] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al enviar documento' },
      { status: 500 }
    )
  }
}
