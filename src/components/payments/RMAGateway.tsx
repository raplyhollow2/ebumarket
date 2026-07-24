'use client'

import { useState, useTransition } from 'react'
import { CreditCard, Smartphone, QrCode, Shield, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'

interface RMAIntegrationProps {
  amount_cents: number
  transaction_id: string
  onPaymentSuccess?: (paymentData: any) => void
  onPaymentError?: (error: string) => void
  className?: string
}

export function RMAIntegration({
  amount_cents,
  transaction_id,
  onPaymentSuccess,
  onPaymentError,
  className = ''
}: RMAIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<'rma' | 'mobile' | 'cod'>('rma')
  const [selectedBank, setSelectedBank] = useState<'bnb' | 'bob' | 'bdb'>('bnb')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const paymentMethods = [
    {
      id: 'rma',
      name: 'RMA Online Payment',
      icon: CreditCard,
      description: 'Secure online payment via Royal Monetary Authority',
      fee_cents: 0,
      badges: ['Secure', 'Instant']
    },
    {
      id: 'mobile',
      name: 'Mobile Banking',
      icon: Smartphone,
      description: 'Pay via mobile banking apps',
      fee_cents: 0,
      badges: ['BNB mPay', 'BOB mBoB', 'BDB ePay']
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: QrCode,
      description: 'Pay with cash upon delivery',
      fee_cents: 3000, // BTN 30
      badges: ['Convenient', 'Cash']
    }
  ]

  const mobileBanks = [
    { id: 'bnb', name: 'BNB mPay', logo: '🏦', color: 'text-blue-600' },
    { id: 'bob', name: 'BOB mBoB', logo: '🏦', color: 'text-green-600' },
    { id: 'bdb', name: 'BDB ePay', logo: '🏦', color: 'text-purple-600' }
  ]

  const handlePayment = async () => {
    startTransition(async () => {
      try {
        setIsProcessing(true)

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock successful payment
        const paymentData = {
          transaction_id,
          payment_method: selectedMethod,
          mobile_bank: selectedMethod === 'mobile' ? selectedBank : null,
          amount_cents,
          status: 'completed',
          timestamp: new Date().toISOString()
        }

        toast.success('Payment completed successfully!')
        onPaymentSuccess?.(paymentData)
      } catch (error) {
        console.error('Payment processing error:', error)
        toast.error('Payment failed')
        onPaymentError?.(error instanceof Error ? error.message : 'Payment processing failed')
      } finally {
        setIsProcessing(false)
      }
    })
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod)
  const Icon = selectedPaymentMethod?.icon

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} className="text-green-600" />
          Bhutan Secure Payment
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method. All transactions are secure and protected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</div>
          <div className="text-3xl font-bold">
            {formatCurrency(amount_cents / 100, 'BTN')}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <Label className="text-sm font-medium mb-3">Select Payment Method</Label>
          <RadioGroup value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as any)}>
            {paymentMethods.map(method => {
              const MethodIcon = method.icon
              const hasFee = method.fee_cents > 0
              const totalWithFee = amount_cents + method.fee_cents

              return (
                <div
                  key={method.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.name}
                      </Label>
                      {method.badges.map(badge => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                    {hasFee && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Processing fee: </span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(method.fee_cents / 100, 'BTN')}
                        </span>
                        <span className="text-gray-400 ml-2">
                          (Total: {formatCurrency(totalWithFee / 100, 'BTN')})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        {/* Mobile Banking Selection */}
        {selectedMethod === 'mobile' && (
          <div>
            <Label className="text-sm font-medium mb-3">Select Your Bank</Label>
            <RadioGroup value={selectedBank} onValueChange={(v) => setSelectedBank(v as any)}>
              <div className="grid grid-cols-3 gap-3">
                {mobileBanks.map(bank => (
                  <div
                    key={bank.id}
                    className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedBank === bank.id
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <RadioGroupItem value={bank.id} id={bank.id} className="sr-only" />
                    <Label htmlFor={bank.id} className="cursor-pointer">
                      <div className={`text-3xl mb-1 ${bank.color}`}>🏦</div>
                      <div className="text-sm font-medium">{bank.name}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* QR Code Placeholder */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <QrCode size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan QR code with your mobile banking app
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  QR expires in 15 minutes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield size={16} className="text-blue-600 mt-1" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>All payments are processed through Royal Monetary Authority (RMA) certified gateways.
              Your transaction is protected by Bhutan's financial regulations.</p>
            </div>
          </div>
        </div>

        {/* GST Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-yellow-600 mt-1" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">GST Notice</p>
              <p>5% GST will be applicable starting January 2026 as per Royal Revenue Authority regulations.</p>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin mr-2">⏳</div>
              Processing...
            </>
          ) : (
            <>
              <Check size={18} className="mr-2" />
              Pay {formatCurrency(amount_cents / 100, 'BTN')}
            </>
          )}
        </Button>

        {/* Payment Method Icons */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <div className="text-xs text-gray-500 text-center">
            <div className="font-medium mb-1">Supported Methods</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <span className="text-lg">📱</span>
              <span className="text-lg">💵</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              RMA • Mobile Banking • Cash
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}