/** NBS IPS QR textual payload (see https://ips.nbs.rs/). */

export type IpsQrParams = {
  /** Account with dashes, e.g. 265-2050310002884-33 */
  accountDashed: string
  payeeName: string
  /** Three-digit payment code (šifra plaćanja), e.g. 287 for donations */
  paymentCode: string
  purpose: string
  /** Amount in RSD; 0 lets the payer enter the amount in the banking app */
  amountRsd?: number
}

/** Converts a Serbian account number to the 18-digit R: tag value. */
export function serbianAccountToIpsR(accountDashed: string): string {
  const digits = accountDashed.replace(/\D/g, '')
  if (digits.length === 18) return digits
  if (digits.length > 18) {
    throw new Error('Invalid account number for IPS QR')
  }
  const bank = digits.slice(0, 3)
  const control = digits.slice(-2)
  const middle = digits.slice(3, -2)
  return bank + middle.padStart(13, '0') + control
}

function formatIpsAmount(amountRsd: number): string {
  const safe = Number.isFinite(amountRsd) && amountRsd >= 0 ? amountRsd : 0
  return safe.toFixed(2).replace('.', ',')
}

export function buildIpsQrString(params: IpsQrParams): string {
  const R = serbianAccountToIpsR(params.accountDashed)
  const name = params.payeeName.trim().slice(0, 70)
  const purpose = params.purpose.trim()
  const amount = formatIpsAmount(params.amountRsd ?? 0)

  const tags = [
    'K:PR',
    'V:01',
    'C:1',
    `R:${R}`,
    `N:${name}`,
    `I:RSD${amount}`,
    `SF:${params.paymentCode}`,
  ]

  if (purpose) {
    tags.push(`S:${purpose}`)
  }

  return tags.join('|')
}

const TALAS_PAYEE = {
  payeeName: 'Kulturni centar Talas',
  paymentCode: '287',
  purpose: 'Donacija',
  amountRsd: 0,
} as const

export const TALAS_IPS_DONATION_RSD: IpsQrParams = {
  accountDashed: '265-2050310002884-33',
  ...TALAS_PAYEE,
}

export const TALAS_IPS_DONATION_FX: IpsQrParams = {
  accountDashed: '265-1000001121861-77',
  ...TALAS_PAYEE,
}
