/**
 * Admin utility functions
 * Check if a wallet address has admin privileges
 */

/**
 * Check if a wallet address is an admin
 * @param walletAddress - The wallet address to check
 * @returns true if the wallet is an admin, false otherwise
 */
export function isAdmin(walletAddress: string): boolean {
  if (!walletAddress) {
    return false
  }

  const adminWallets = process.env.ADMIN_WALLET_ADDRESSES || ''
  const adminList = adminWallets
    .split(',')
    .map((addr) => addr.trim().toLowerCase())
    .filter((addr) => addr.length > 0)

  return adminList.includes(walletAddress.toLowerCase())
}

/**
 * Get list of all admin wallet addresses
 * @returns Array of admin wallet addresses
 */
export function getAdminWallets(): string[] {
  const adminWallets = process.env.ADMIN_WALLET_ADDRESSES || ''
  return adminWallets
    .split(',')
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0)
}
