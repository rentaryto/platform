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

  // Extract first name only (before first space)
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  const tenantFirstName = escapeHtml(getFirstName(tenant.name))
  const userFirstName = escapeHtml(getFirstName(userData.name))
  const apartmentNameSafe = escapeHtml(document.apartment.name)
  const descriptionSafe = document.description ? escapeHtml(document.description) : null

  const typeLabel =
    document.type === 'invoice' ? 'Factura' :
    document.type === 'contract' ? 'Contrato' :
    document.type === 'contract_extension' ? 'Ampliación de contrato' : 'Documento'

  // Subtype labels for invoices
  const invoiceSubtypeLabels: Record<string, string> = {
    water: 'Agua',
    electricity: 'Luz',
    gas: 'Gas',
    other: 'Otros',
  }

  // Subject: for invoices with subtype -> "Factura Luz Alberto Aguilera 1, 4A"
  let subject = ''
  if (document.type === 'invoice' && document.subtype) {
    const subtypeLabel = invoiceSubtypeLabels[document.subtype] || document.subtype
    subject = `Factura ${subtypeLabel} ${apartmentNameSafe}`
  } else {
    subject = `${typeLabel} ${apartmentNameSafe}`
  }

  console.log('[EMAIL SERVICE] Preparing email to:', tenant.email)
  console.log('[EMAIL SERVICE] From:', 'Rentaryto <noreply@app.rentaryto.com>')
  console.log('[EMAIL SERVICE] Subject:', subject)

  // Verify RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('[EMAIL SERVICE] RESEND_API_KEY not configured!')
    throw new Error('Servicio de email no configurado')
  }

  // Send email using Resend
  const { data, error } = await resend.emails.send({
    from: 'Rentaryto <noreply@app.rentaryto.com>',
    to: tenant.email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 40px 20px;">

        <div style="margin-bottom: 32px;">
          <p style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937;">
            Hola ${tenantFirstName},
          </p>
          <p style="margin: 0; font-size: 16px; color: #1f2937; line-height: 1.5;">
            Te comparto ${document.type === 'invoice' ? 'la factura' : document.type === 'contract' || document.type === 'contract_extension' ? 'el contrato' : 'un documento'} de <strong>${apartmentNameSafe}</strong>.
          </p>
        </div>

        ${descriptionSafe ? `
        <div style="margin-bottom: 32px; padding: 16px; background-color: #f9fafb; border-left: 3px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; color: #374151;">
            ${descriptionSafe}
          </p>
        </div>
        ` : ''}

        <div style="margin: 32px 0; text-align: center;">
          <a href="${urlData.signedUrl}"
             style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
            Ver documento
          </a>
        </div>

        <div style="margin-top: 48px;">
          <p style="margin: 0 0 4px 0; font-size: 15px; color: #6b7280;">
            Saludos,
          </p>
          <p style="margin: 0 0 32px 0; font-size: 15px; color: #1f2937;">
            <strong>${userFirstName}</strong>
          </p>
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            Este enlace estará disponible durante 1 año.
          </p>
        </div>
      </body>
      </html>
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
