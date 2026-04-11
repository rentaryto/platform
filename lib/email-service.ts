import { Resend } from 'resend'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendDocumentEmailParams {
  documentId: string
  userId: string
}

export async function sendDocumentEmail({ documentId, userId }: SendDocumentEmailParams) {
  console.log('[EMAIL SERVICE] Starting email send for document:', documentId)

  // Get document with relations
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      apartment: {
        userId: userId,
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
    throw new Error('Documento no encontrado')
  }

  console.log('[EMAIL SERVICE] Document found:', document.fileName)

  if (!document.apartment.currentTenant) {
    throw new Error('El inmueble no tiene inquilino asignado')
  }

  const tenant = document.apartment.currentTenant
  console.log('[EMAIL SERVICE] Tenant email:', tenant.email)

  const userData = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!userData) {
    throw new Error('Usuario no encontrado')
  }

  console.log('[EMAIL SERVICE] User found:', userData.name)

  // Generate signed URL valid for 1 year
  const supabase = await createClient()
  const { data: urlData, error: urlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.fileUrl, 31536000) // 1 year in seconds

  if (urlError) {
    console.error('[EMAIL SERVICE] Signed URL error:', urlError)
    throw new Error('Error al generar enlace del documento')
  }

  console.log('[EMAIL SERVICE] Signed URL generated successfully')

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

  console.log('[EMAIL SERVICE] Preparing email to:', tenant.email)
  console.log('[EMAIL SERVICE] From:', 'Rentaryto <noreply@app.rentaryto.com>')
  console.log('[EMAIL SERVICE] Subject:', `Nuevo documento: ${fileNameSafe}`)

  // Verify RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('[EMAIL SERVICE] RESEND_API_KEY not configured!')
    throw new Error('Servicio de email no configurado')
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
    console.error('[EMAIL SERVICE] Resend API error:', error)
    throw new Error(`Error al enviar email: ${error.message || 'Unknown error'}`)
  }

  console.log('[EMAIL SERVICE] Email sent successfully. ID:', data?.id)

  // Update document status
  await prisma.document.update({
    where: { id: documentId },
    data: {
      sendStatus: 'sent',
      sentAt: new Date(),
    },
  })

  console.log('[EMAIL SERVICE] Document status updated to sent')

  return { success: true, emailId: data?.id }
}
