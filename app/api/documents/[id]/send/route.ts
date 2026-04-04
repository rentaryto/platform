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
      include: {
        apartment: {
          include: {
            currentTenant: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    if (!document.apartment.currentTenant) {
      return NextResponse.json(
        { error: 'El inmueble no tiene inquilino asignado' },
        { status: 400 }
      )
    }

    const tenant = document.apartment.currentTenant
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Generate signed URL valid for 1 year
    const supabase = await createClient()
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.fileUrl, 31536000) // 1 year in seconds

    if (urlError) {
      console.error('Signed URL error:', urlError)
      return NextResponse.json(
        { error: 'Error al generar enlace del documento' },
        { status: 500 }
      )
    }

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

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Rentaryto <noreply@rentaryto.com>',
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
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Error al enviar email' },
        { status: 500 }
      )
    }

    // Update document status
    await prisma.document.update({
      where: { id: params.id },
      data: {
        sendStatus: 'sent',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending document:', error)
    return NextResponse.json(
      { error: 'Error al enviar documento' },
      { status: 500 }
    )
  }
}
