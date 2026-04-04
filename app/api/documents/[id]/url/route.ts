import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    // Generate signed URL valid for 1 hour
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.fileUrl, 3600)

    if (error) {
      console.error('Signed URL error:', error)
      return NextResponse.json(
        { error: 'Error al generar URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error('Error getting document URL:', error)
    return NextResponse.json(
      { error: 'Error al obtener documento' },
      { status: 500 }
    )
  }
}
