import QRCode from 'qrcode'

export async function generateTicketQRCode(ticketNumber: string, eventId: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        ticketNumber,
        eventId,
        timestamp: new Date().toISOString()
      }),
      {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 400
      }
    )

    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `VT-${timestamp}-${random}`
}
