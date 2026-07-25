/**
 * GST (Goods and Services Tax) Calculator
 * Bhutan GST compliance starting January 2026
 * Current rate: 5%
 */

export interface GSTConfig {
  rate: number
  enabled: boolean
  registration_number?: string
  effective_date?: Date
}

export interface GSTCalculation {
  amount_cents: number
  gst_rate: number
  gst_cents: number
  total_cents: number
  breakdown: {
    subtotal: number
    gst: number
    total: number
  }
}

export interface InvoiceWithGST {
  invoice_number: string
  date: Date
  seller_info: {
    name: string
    gst_registration: string
    address: string
  }
  buyer_info: {
    name: string
    address?: string
  }
  items: Array<{
    description: string
    quantity: number
    unit_price_cents: number
    amount_cents: number
    gst_cents: number
    total_cents: number
  }>
  totals: {
    subtotal_cents: number
    gst_cents: number
    total_cents: number
  }
  gst_rate: number
}

/**
 * Calculate GST for an amount
 */
export function calculateGST(amount_cents: number, config: GSTConfig): GSTCalculation {
  if (!config.enabled) {
    return {
      amount_cents,
      gst_rate: 0,
      gst_cents: 0,
      total_cents: amount_cents,
      breakdown: {
        subtotal: amount_cents / 100,
        gst: 0,
        total: amount_cents / 100
      }
    }
  }

  const gst_cents = Math.round(amount_cents * (config.rate / 100))
  const total_cents = amount_cents + gst_cents

  return {
    amount_cents,
    gst_rate: config.rate,
    gst_cents,
    total_cents,
    breakdown: {
      subtotal: amount_cents / 100,
      gst: gst_cents / 100,
      total: total_cents / 100
    }
  }
}

/**
 * Generate GST-compliant invoice
 */
export function generateGSTInvoice(
  transaction_id: string,
  items: Array<{
    description: string
    quantity: number
    unit_price_cents: number
  }>,
  config: GSTConfig,
  seller_info: {
    name: string
    gst_registration: string
    address: string
  },
  buyer_info: {
    name: string
    address?: string
  }
): InvoiceWithGST {
  const now = new Date()

  // Calculate line items with GST
  const invoiceItems = items.map(item => {
    const amount_cents = item.quantity * item.unit_price_cents
    const gstCalc = calculateGST(amount_cents, config)

    return {
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      amount_cents,
      gst_cents: gstCalc.gst_cents,
      total_cents: gstCalc.total_cents
    }
  })

  // Calculate totals
  const subtotal_cents = invoiceItems.reduce((sum, item) => sum + item.amount_cents, 0)
  const gstCalc = calculateGST(subtotal_cents, config)

  return {
    invoice_number: `INV-${transaction_id.toUpperCase()}-${now.getFullYear()}`,
    date: now,
    seller_info: {
      name: seller_info.name,
      gst_registration: seller_info.gst_registration,
      address: seller_info.address
    },
    buyer_info: {
      name: buyer_info.name,
      address: buyer_info.address
    },
    items: invoiceItems,
    totals: {
      subtotal_cents,
      gst_cents: gstCalc.gst_cents,
      total_cents: gstCalc.total_cents
    },
    gst_rate: config.rate
  }
}

/**
 * Format invoice for display/export
 */
export function formatInvoiceForDisplay(invoice: InvoiceWithGST): string {
  const lines = [
    `INVOICE: ${invoice.invoice_number}`,
    `Date: ${invoice.date.toLocaleDateString()}`,
    '',
    'SELLER:',
    invoice.seller_info.name,
    `GST Registration: ${invoice.seller_info.gst_registration}`,
    invoice.seller_info.address,
    '',
    'BUYER:',
    invoice.buyer_info.name,
    invoice.buyer_info.address || '',
    '',
    'ITEMS:',
    ...invoice.items.map(item => {
      const unitPrice = (item.unit_price_cents / 100).toFixed(2)
      const lineTotal = (item.amount_cents / 100).toFixed(2)
      const gst = (item.gst_cents / 100).toFixed(2)
      const total = (item.total_cents / 100).toFixed(2)

      return [
        `${item.description}`,
        `  Qty: ${item.quantity} × Nu. ${unitPrice}`,
        `  Amount: Nu. ${lineTotal}`,
        `  GST (${invoice.gst_rate}%): Nu. ${gst}`,
        `  Total: Nu. ${total}`
      ].join('\n')
    }),
    '',
    'TOTALS:',
    `Subtotal: Nu. ${(invoice.totals.subtotal_cents / 100).toFixed(2)}`,
    `GST (${invoice.gst_rate}%): Nu. ${(invoice.totals.gst_cents / 100).toFixed(2)}`,
    `TOTAL: Nu. ${(invoice.totals.total_cents / 100).toFixed(2)}`,
    '',
    `GST Registration: ${invoice.seller_info.gst_registration}`,
    `Invoice generated in compliance with Bhutan GST regulations`
  ]

  return lines.join('\n')
}

/**
 * Check if GST should be applied
 */
export function shouldApplyGST(config: GSTConfig, transaction_date?: Date): boolean {
  if (!config.enabled) {
    return false
  }

  const effectiveDate = config.effective_date || new Date('2026-01-01')
  const checkDate = transaction_date || new Date()

  return checkDate >= effectiveDate
}

/**
 * Get GST configuration from settings
 */
export async function getGSTConfig(): Promise<GSTConfig> {
  try {
    const response = await fetch('/api/gst/settings')
    const result = await response.json()

    if (result.success && result.data) {
      return {
        rate: result.data.gst_rate,
        enabled: result.data.gst_enabled,
        registration_number: result.data.gst_registration_number,
        effective_date: result.data.effective_date ? new Date(result.data.effective_date) : undefined
      }
    }

    // Default configuration
    return {
      rate: 5.0,
      enabled: false,
      effective_date: new Date('2026-01-01')
    }
  } catch (error) {
    console.error('Error fetching GST config:', error)
    return {
      rate: 5.0,
      enabled: false,
      effective_date: new Date('2026-01-01')
    }
  }
}

/**
 * Validate GST registration number format
 */
export function validateGSTNumber(gstNumber: string): boolean {
  // Bhutan GST number format validation
  // Format: 123456789 (9 digits) or with prefix
  const gstPattern = /^\d{9}$/

  if (!gstPattern.test(gstNumber)) {
    return false
  }

  // Additional validation logic could be added here
  return true
}

/**
 * Calculate GST for different scenarios
 */
export class GSTCalculator {
  private config: GSTConfig

  constructor(config: GSTConfig) {
    this.config = config
  }

  /**
   * Calculate GST for a single item
   */
  calculateItemGST(unitPriceCents: number, quantity: number = 1): GSTCalculation {
    const amountCents = unitPriceCents * quantity
    return calculateGST(amountCents, this.config)
  }

  /**
   * Calculate GST for multiple items
   */
  calculateBulkGST(items: Array<{ price_cents: number; quantity: number }>): GSTCalculation {
    const totalCents = items.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0)
    return calculateGST(totalCents, this.config)
  }

  /**
   * Calculate reverse GST (for refunds)
   */
  calculateReverseGST(totalWithGstCents: number): { original_cents: number; gst_cents: number } {
    if (!this.config.enabled) {
      return {
        original_cents: totalWithGstCents,
        gst_cents: 0
      }
    }

    const gstRate = this.config.rate / 100
    const originalCents = Math.round(totalWithGstCents / (1 + gstRate))
    const gstCents = totalWithGstCents - originalCents

    return { original_cents: originalCents, gst_cents: gstCents }
  }

  /**
   * Round GST amount according to Bhutan tax regulations
   */
  roundGSTAmount(cents: number): number {
    // Round to nearest 5 chhertums (0.05 BTN)
    return Math.round(cents / 5) * 5
  }
}

/**
 * Export GST report for tax filing
 */
export interface GSTReportData {
  period_start: Date
  period_end: Date
  total_sales_cents: number
  total_gst_collected_cents: number
  transaction_count: number
  registration_number: string
}

export function generateGSTReport(data: GSTReportData): string {
  const reportLines = [
    'GST COMPLIANCE REPORT',
    '====================',
    '',
    `Period: ${data.period_start.toLocaleDateString()} to ${data.period_end.toLocaleDateString()}`,
    `GST Registration: ${data.registration_number}`,
    `Report Generated: ${new Date().toLocaleString()}`,
    '',
    'SUMMARY:',
    `Total Transactions: ${data.transaction_count}`,
    `Total Sales (excluding GST): Nu. ${(data.total_sales_cents / 100).toFixed(2)}`,
    `Total GST Collected: Nu. ${(data.total_gst_collected_cents / 100).toFixed(2)}`,
    `Total with GST: Nu. ${((data.total_sales_cents + data.total_gst_collected_cents) / 100).toFixed(2)}`,
    '',
    'This report is generated in compliance with Bhutan GST regulations.',
    'For official tax filing, please verify with the Royal Revenue Authority.'
  ]

  return reportLines.join('\n')
}