import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    console.error('[SEND EMAIL] Unauthorized')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  console.log('[SEND EMAIL] Starting email send for document:', params.id)

  try {
    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
      include: {
        apartment: {
          include: {
            currentTenant: true,
          },
        },
      },
    })

    if (!document) {
      console.error('[SEND EMAIL] Document not found:', params.id)
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    console.log('[SEND EMAIL] Document found:', document.fileName)

    if (!document.apartment.currentTenant) {
      console.error('[SEND EMAIL] No tenant assigned to apartment')
      return NextResponse.json(
        { error: 'El inmueble no tiene inquilino asignado' },
        { status: 400 }
      )
    }

    const tenant = document.apartment.currentTenant
    console.log('[SEND EMAIL] Tenant email:', tenant.email)

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!userData) {
      console.error('[SEND EMAIL] User not found:', user.id)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log('[SEND EMAIL] User found:', userData.name)

    // Generate signed URL valid for 1 year
    const supabase = await createClient()
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.fileUrl, 31536000) // 1 year in seconds

    if (urlError) {
      console.error('[SEND EMAIL] Signed URL error:', urlError)
      return NextResponse.json(
        { error: 'Error al generar enlace del documento' },
        { status: 500 }
      )
    }

    console.log('[SEND EMAIL] Signed URL generated successfully')

    // Security: Sanitize data for HTML injection prevention
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const tenantNameSafe = escapeHtml(tenant.name)
    const userNameSafe = escapeHtml(userData.name)
    const apartmentNameSafe = escapeHtml(document.apartment.name)
    const fileNameSafe = escapeHtml(document.fileName)
    const descriptionSafe = document.description ? escapeHtml(document.description) : null

    const typeLabel =
      document.type === 'invoice' ? 'Factura' :
      document.type === 'contract' ? 'Contrato' : 'Otro'

    console.log('[SEND EMAIL] Preparing email to:', tenant.email)
    console.log('[SEND EMAIL] From:', 'Rentaryto <noreply@app.rentaryto.com>')
    console.log('[SEND EMAIL] Subject:', `Nuevo documento: ${fileNameSafe}`)

    // Verify RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[SEND EMAIL] RESEND_API_KEY not configured!')
      return NextResponse.json(
        { error: 'Servicio de email no configurado' },
        { status: 500 }
      )
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Rentaryto <noreply@app.rentaryto.com>',
      to: tenant.email,
      subject: `Nuevo documento: ${fileNameSafe}`,
      html: `
        <h2>Hola ${tenantNameSafe},</h2>
        <p>${userNameSafe} te ha enviado un nuevo documento para ${apartmentNameSafe}.</p>
        <p><strong>Tipo:</strong> ${typeLabel}</p>
        ${descriptionSafe ? `<p><strong>Descripción:</strong> ${descriptionSafe}</p>` : ''}
        <p><a href="${urlData.signedUrl}" target="_blank">Ver documento</a></p>
        <p><em>Este enlace es válido por 1 año.</em></p>
        <br/>
        <p>Saludos,<br/>${userNameSafe}</p>
      `,
    })

    if (error) {
      console.error('[SEND EMAIL] Resend API error:', error)
      return NextResponse.json(
        { error: `Error al enviar email: ${error.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    console.log('[SEND EMAIL] Email sent successfully. ID:', data?.id)

    // Update document status
    await prisma.document.update({
      where: { id: params.id },
      data: {
        sendStatus: 'sent',
        sentAt: new Date(),
      },
    })

    console.log('[SEND EMAIL] Document status updated to sent')

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    console.error('[SEND EMAIL] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al enviar documento' },
      { status: 500 }
    )
  }
}
