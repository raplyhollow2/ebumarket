/**
 * Internationalization (i18n) Configuration
 * English and Dzongkha translations for Bhutan marketplace
 */

export type Locale = 'en' | 'dz'

export interface LocaleConfig {
  code: Locale
  name: string
  nativeName: string
  flag: string
  rtl?: boolean
}

export const supportedLocales: LocaleConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'dz',
    name: 'Dzongkha',
    nativeName: 'རྫོང་ཁ',
    flag: '🇧🇹'
  }
]

export const defaultLocale: Locale = 'en'

/**
 * Translation strings
 */
export const translations = {
  en: {
    // Common
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',

    // Navigation
    home: 'Home',
    marketplace: 'Marketplace',
    donations: 'Donations',
    activity: 'Activity',
    profile: 'Profile',
    admin: 'Admin Panel',

    // Marketplace
    all_items: 'All Items',
    for_sale: 'For Sale',
    free_items: 'Free Items',
    verified: 'Verified',
    trending: 'Trending',
    new_arrivals: 'New Arrivals',

    // Listings
    title: 'Title',
    description: 'Description',
    category: 'Category',
    size: 'Size',
    condition: 'Condition',
    price: 'Price',
    free: 'Free',
    location: 'Location',
    seller: 'Seller',
    views: 'Views',
    likes: 'Likes',
    comments: 'Comments',

    // Actions
    buy_now: 'Buy Now',
    add_to_cart: 'Add to Cart',
    make_offer: 'Make Offer',
    send_message: 'Send Message',
    follow: 'Follow',
    following: 'Following',
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    report: 'Report',

    // Social
    followers: 'Followers',
    following: 'Following',
    followers_count: '{count} followers',
    following_count: '{count} following',
    like: 'Like',
    unlike: 'Unlike',
    comment: 'Comment',
    reply: 'Reply',

    // Donation
    donate: 'Donate',
    claim: 'Claim',
    donation: 'Donation',
    donations: 'Donations',
    impact: 'Impact',
    help_needed: 'Help Needed',
    give_back: 'Give Back',
    community_support: 'Community Support',

    // Payment
    payment: 'Payment',
    pay_now: 'Pay Now',
    payment_method: 'Payment Method',
    card_payment: 'Card Payment',
    mobile_banking: 'Mobile Banking',
    cash_on_delivery: 'Cash on Delivery',
    processing: 'Processing',
    payment_successful: 'Payment Successful',
    payment_failed: 'Payment Failed',

    // Currency
    currency: 'BTN',
    price_range: 'Price Range',
    free_shipping: 'Free Shipping',

    // Location
    bhutan: 'Bhutan',
    thimphu: 'Thimphu',
    paro: 'Paro',
    phuentsholing: 'Phuentsholing',

    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    last_week: 'Last Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    hours_ago: '{hours}h ago',
    days_ago: '{days}d ago',
    weeks_ago: '{weeks}w ago',
    months_ago: '{months}mo ago',
    years_ago: '{years}y ago',

    // Messages
    messages: 'Messages',
    conversations: 'Conversations',
    new_message: 'New Message',
    send: 'Send',
    typing: 'Typing...',
    online: 'Online',
    offline: 'Offline',

    // Notifications
    notifications: 'Notifications',
    mark_all_read: 'Mark All Read',
    no_notifications: 'No Notifications',
    notification_like: 'liked your item',
    notification_follow: 'started following you',
    notification_comment: 'commented on your item',
    notification_message: 'sent you a message',
    notification_sale: 'purchased your item',

    // Admin
    dashboard: 'Dashboard',
    users: 'Users',
    listings: 'Listings',
    transactions: 'Transactions',
    reports: 'Reports',
    settings: 'Settings',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    verified_status: 'Verified',
    rejected_status: 'Rejected',

    // Analytics
    analytics: 'Analytics',
    performance: 'Performance',
    insights: 'Insights',
    total_views: 'Total Views',
    total_likes: 'Total Likes',
    conversion_rate: 'Conversion Rate',
    sales: 'Sales',
    revenue: 'Revenue',

    // AI Features
    ai_enhance: 'AI Enhance',
    ai_generate: 'AI Generate',
    auto_description: 'Auto Description',
    photo_enhancer: 'Photo Enhancer',

    // Boost
    boost: 'Boost',
    boosted: 'Promoted',
    promote: 'Promote',
    increase_visibility: 'Increase Visibility',

    // GST
    gst: 'GST',
    gst_included: 'GST Included',
    subtotal: 'Subtotal',
    total: 'Total',
    invoice: 'Invoice',
    receipt: 'Receipt',

    // Environmental
    environmental_impact: 'Environmental Impact',
    items_saved: 'Items Saved',
    co2_prevented: 'CO₂ Prevented',
    water_saved: 'Water Saved',
    zero_waste: 'Zero Waste',
    sustainable: 'Sustainable'
  },

  dz: {
    // Common
    welcome: 'རྫོན་ཁ་ཕེབ',
    loading: 'སྒེུརནམ་...',
    error: 'སྐྱོན་བྱུང་བ་བརྒྱུན་པས',
    success: 'མཐར་སོང་བ།ིན',
    cancel: 'འདོར་བ་',
    save: 'སྲུར་བཞག',
    delete: 'བསུབས་གཏངས',
    edit: 'ཞུན་དགབ',
    search: 'འཚོལ་ཞིབ་བྱེད',
    filter: 'གདམས་སྤྱུས་',
    sort: 'རིམ་སྒྲིབསྟན',

    // Navigation
    home: 'ཁྱིམ',
    marketplace: 'ཚོང་འདུས',
    donations: 'སྦྱིན་བརྒྱུན',
    activity: 'བྱ་སྤྱོན་གསལ',
    profile: 'མི་ཚག',
    admin: 'དོ་དམ་པའི་ལས་ཐོག',

    // Marketplace
    all_items: 'དངོས་གི་རྣམས',
    for_sale: 'ཚོང་རྫས་འདུས',
    free_items: 'རིན་པའི་རྣམས',
    verified: 'བདེན་སྲུབས',
    trending: 'ཉམས་རྒྱུན་པའི་རྣམས',
    new_arrivals: 'གསརཔའི་རྣམས',

    // Listings
    title: 'མིང་པོ',
    description: 'བཤད་སྲིབ',
    category: 'དབྱེ་རིག་',
    size: 'ཚདཔ་',
    condition: 'གནས་ཚུལ',
    price: 'གོང་ཚིན',
    free: 'རིན',
    location: 'ས་ཁང',
    seller: 'ཚོང་པ',
    views: 'མཐོང་བསྣང་',
    likes: 'དགའ་བཞག',
    comments: 'བསམ་བལུང་',

    // Actions
    buy_now: 'ད་ལན་ཉོ་',
    add_to_cart: 'རྡུ་མིག་ལུ་བསྡུད',
    make_offer: 'གོང་ཚིན་བཀོན་',
    send_message: 'འཕྲིན་ཐོག་སྤྲདབ',
    follow: 'རྗེས་འདེད',
    following: 'རྗེས་འདེད་འདུག',
    save: 'སྲུར་བཞག',
    saved: 'སྲུར་བཞག',
    share: 'སྤེལ་བ',
    report: 'སྙོར་ཞུ་',

    // Donation
    donate: 'སྦྱིན་བརྒྱུན',
    claim: 'རེ་དཔ',
    donation: 'སྦྱིན་བརྒྱུན',
    donations: 'སྦྱིན་བརྒྱུན',
    impact: 'ཕན་ཡོན',
    help_needed: 'རོགས་རམ་དགོས་',
    give_back: 'སླེགས་སྲུབས',
    community_support: 'མི་སེར་གི་རོགས་རམ',

    // Location
    bhutan: 'འབྲུག',
    thimphu: 'ཐིམ་ཕུ་',
    paro: 'སྤ་རོ',
    phuentsholing: 'ཕུན་ཚོངས་སྲིབ'

    // Environmental
    environmental_impact: 'གནས་སྐབས་ཀྱི་ཕན་ཡོན',
    items_saved: 'རྣམས་བསྲུབས',
    co2_prevented: 'CO₂ གདུགས་བཏུབ་པ།',
    water_saved: 'ཆུ་བསྲུབས',
    zero_waste: 'གད་སྙོབུབས་མེད',
    sustainable: 'རྒྱུན་སྐྱོབ་པ།
  }
}

/**
 * Get translation for a key
 */
export function t(key: string, locale: Locale = defaultLocale): string {
  const localeTranslations = translations[locale] as any

  if (!localeTranslations) {
    console.warn(`Translations not found for locale: ${locale}`)
    return key
  }

  const value = localeTranslations[key.replace(/\./g, '_')]

  if (!value) {
    console.warn(`Translation not found for key: ${key} in locale: ${locale}`)
    return key
  }

  return value
}

/**
 * Format currency with locale
 */
export function formatCurrencyWithLocale(
  amountCents: number,
  currency: string = 'BTN',
  locale: Locale = defaultLocale
): string {
  const amount = amountCents / 100

  if (locale === 'dz') {
    // Dzongkha number formatting
    return `${amount.toFixed(2)} ${currency}`
  }

  // Default English formatting
  return new Intl.NumberFormat(locale === 'dz' ? 'dz-BT' : 'en-BT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format date with locale
 */
export function formatDateWithLocale(
  date: Date,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode = locale === 'dz' ? 'dz-BT' : 'en-BT'

  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(date)
}

/**
 * Format number with locale
 */
export function formatNumberWithLocale(
  number: number,
  locale: Locale = defaultLocale
): string {
  const localeCode = locale === 'dz' ? 'dz-BT' : 'en-BT'

  return new Intl.NumberFormat(localeCode).format(number)
}

/**
 * Detect user's preferred locale
 */
export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language.split('-')[0]

  if (browserLang === 'dz') {
    return 'dz'
  }

  return defaultLocale
}

/**
 * Get locale from user preferences
 */
export async function getUserLocale(): Promise<Locale> {
  try {
    const response = await fetch('/api/user/preferences')
    const result = await response.json()

    if (result.success && result.data?.locale) {
      return result.data.locale
    }

    return detectUserLocale()
  } catch (error) {
    console.error('Error fetching user locale:', error)
    return detectUserLocale()
  }
}

/**
 * Set user locale preference
 */
export async function setUserLocale(locale: Locale): Promise<boolean> {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale })
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error setting user locale:', error)
    return false
  }
}