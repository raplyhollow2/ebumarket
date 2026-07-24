/**
 * RMA (Royal Monetary Authority) Payment Gateway Integration
 * Bhutan's official payment system for online transactions
 */

export interface RMAPaymentConfig {
  merchant_id: string
  terminal_id: string
  secret_key: string
  environment: 'test' | 'production'
}

export interface RMAPaymentRequest {
  amount_cents: number
  currency: string
  transaction_id: string
  description: string
  customer_name: string
  customer_email: string
  customer_phone: string
  return_url: string
  cancel_url: string
}

export interface RMAPaymentResponse {
  success: boolean
  transaction_id: string
  payment_id: string
  status: string
  amount_cents: number
  currency: string
  timestamp: string
  error_code?: string
  error_message?: string
}

/**
 * Initialize RMA payment
 */
export async function initiateRMAPayment(
  config: RMAPaymentConfig,
  payment: RMAPaymentRequest
): Promise<RMAPaymentResponse> {
  try {
    // RMA API endpoint based on environment
    const apiUrl = config.environment === 'production'
      ? 'https://rma.org.bt/api/payment'
      : 'https://sandbox.rma.org.bt/api/payment'

    const payload = {
      merchant_id: config.merchant_id,
      terminal_id: config.terminal_id,
      amount: payment.amount_cents / 100, // Convert to decimal
      currency: payment.currency,
      transaction_id: payment.transaction_id,
      description: payment.description,
      customer_name: payment.customer_name,
      customer_email: payment.customer_email,
      customer_phone: payment.customer_phone,
      return_url: payment.return_url,
      cancel_url: payment.cancel_url,
      timestamp: new Date().toISOString()
    }

    // Generate signature
    const signature = generateRMASignature(config.secret_key, payload)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signature}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`RMA API error: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: result.status === 'success',
      transaction_id: result.transaction_id || payment.transaction_id,
      payment_id: result.payment_id,
      status: result.status,
      amount_cents: payment.amount_cents,
      currency: payment.currency,
      timestamp: result.timestamp || new Date().toISOString()
    }
  } catch (error) {
    console.error('RMA payment initiation error:', error)
    return {
      success: false,
      transaction_id: payment.transaction_id,
      payment_id: '',
      status: 'failed',
      amount_cents: payment.amount_cents,
      currency: payment.currency,
      timestamp: new Date().toISOString(),
      error_code: 'RMA_INIT_ERROR',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verify RMA payment callback
 */
export async function verifyRMAPayment(
  config: RMAPaymentConfig,
  payment_id: string,
  transaction_id: string
): Promise<RMAPaymentResponse> {
  try {
    const apiUrl = config.environment === 'production'
      ? 'https://rma.org.bt/api/verify'
      : 'https://sandbox.rma.org.bt/api/verify'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.secret_key}`
      },
      body: JSON.stringify({
        merchant_id: config.merchant_id,
        payment_id,
        transaction_id
      })
    })

    if (!response.ok) {
      throw new Error(`RMA verification error: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: result.status === 'completed',
      transaction_id,
      payment_id,
      status: result.status,
      amount_cents: Math.round(result.amount * 100),
      currency: result.currency,
      timestamp: result.timestamp
    }
  } catch (error) {
    console.error('RMA payment verification error:', error)
    return {
      success: false,
      transaction_id,
      payment_id,
      status: 'failed',
      amount_cents: 0,
      currency: 'BTN',
      timestamp: new Date().toISOString(),
      error_code: 'RMA_VERIFY_ERROR',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Process RMA refund
 */
export async function processRMARefund(
  config: RMAPaymentConfig,
  payment_id: string,
  refund_amount_cents?: number,
  reason?: string
): Promise<{ success: boolean; refund_id?: string; error?: string }> {
  try {
    const apiUrl = config.environment === 'production'
      ? 'https://rma.org.bt/api/refund'
      : 'https://sandbox.rma.org.bt/api/refund'

    const payload = {
      merchant_id: config.merchant_id,
      payment_id,
      refund_amount: refund_amount_cents ? refund_amount_cents / 100 : undefined,
      reason,
      timestamp: new Date().toISOString()
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.secret_key}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`RMA refund error: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: result.status === 'success',
      refund_id: result.refund_id
    }
  } catch (error) {
    console.error('RMA refund error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate RMA signature for authentication
 */
function generateRMASignature(secretKey: string, payload: any): string {
  // In production, this would use actual cryptographic signing
  // For now, using a simple hash-based approach
  const dataString = JSON.stringify(payload)
  const signature = Buffer.from(dataString + secretKey).toString('base64')
  return signature
}

/**
 * Mobile banking QR code payment support
 */
export interface MobileBankingConfig {
  bank_name: 'BNB' | 'BOB' | 'BDB'
  merchant_account: string
  qr_expiration_minutes?: number
}

export function generateMobileBankingQR(
  config: MobileBankingConfig,
  amount_cents: number,
  transaction_id: string
): string {
  const qrData = {
    bank: config.bank_name,
    account: config.merchant_account,
    amount: amount_cents / 100,
    ref: transaction_id,
    timestamp: new Date().toISOString()
  }

  // In production, this would generate actual QR code image
  return JSON.stringify(qrData)
}

/**
 * Check if RMA payment is available
 */
export function isRMAAvailable(): boolean {
  // Check if RMA gateway is configured and available
  return process.env.RMA_MERCHANT_ID !== undefined &&
         process.env.RMA_TERMINAL_ID !== undefined &&
         process.env.RMA_SECRET_KEY !== undefined
}

/**
 * Get supported payment methods for Bhutan
 */
export function getBhutanPaymentMethods(): Array<{
  id: string
  name: string
  type: 'online' | 'mobile' | 'cod'
  available: boolean
  icon?: string
}> {
  return [
    {
      id: 'rma',
      name: 'RMA Online Payment',
      type: 'online',
      available: isRMAAvailable(),
      icon: '💳'
    },
    {
      id: 'bnb-mpay',
      name: 'BNB mPay',
      type: 'mobile',
      available: true,
      icon: '📱'
    },
    {
      id: 'bob-mbob',
      name: 'BOB mBoB',
      type: 'mobile',
      available: true,
      icon: '📱'
    },
    {
      id: 'bdb-epay',
      name: 'BDB ePay',
      type: 'mobile',
      available: true,
      icon: '📱'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cod',
      available: true,
      icon: '💵'
    }
  ]
}