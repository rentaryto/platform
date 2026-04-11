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

  // Verify apartment ownership
  const apartment = await prisma.apartment.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
  })

  if (!apartment) {
    return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
  }

  const documents = await prisma.document.findMany({
    where: { apartmentId: params.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(documents)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Verify apartment ownership
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        currentTenant: true,
      },
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const subtype = formData.get('subtype') as string | null
    const description = formData.get('description') as string | null
    const startDate = formData.get('startDate') as string | null
    const endDate = formData.get('endDate') as string | null
    const sendNow = formData.get('sendNow') === 'true'

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Archivo y tipo son requeridos' },
        { status: 400 }
      )
    }

    // Security: Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo no puede superar 10MB' },
        { status: 400 }
      )
    }

    // Security: Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo PDF, imágenes, Word y Excel' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const supabase = await createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
    const filePath = `${user.id}/${params.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir archivo' },
        { status: 500 }
      )
    }

    // Store file path instead of URL (we'll generate signed URLs when needed)
    // Create document record
    const sendStatus = type === 'invoice' && sendNow ? 'pending' : 'not_applicable'
    const paidStatus = type === 'invoice' ? 'unpaid' : 'not_applicable'

    const document = await prisma.document.create({
      data: {
        apartmentId: params.id,
        type,
        subtype: subtype || null,
        fileName: file.name,
        fileUrl: filePath, // Store the path, not the public URL
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sendStatus,
        paidStatus,
      },
    })

    // TODO: If sendNow is true and type is invoice, send email using Resend

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Error al crear documento' },
      { status: 500 }
    )
  }
}
