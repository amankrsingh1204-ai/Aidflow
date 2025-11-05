import * as StellarSdk from 'stellar-sdk'
import freighterApi from '@stellar/freighter-api'

const HORIZON_URL = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || ''
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'

const server = new StellarSdk.Horizon.Server(HORIZON_URL)

const stellarService = {
  // Get account details
  async getAccount(publicKey) {
    try {
      return await server.loadAccount(publicKey)
    } catch (error) {
      console.error('Error loading account:', error)
      throw error
    }
  },

  // Get account balance
  async getBalance(publicKey) {
    try {
      const account = await server.loadAccount(publicKey)
      const nativeBalance = account.balances.find(b => b.asset_type === 'native')
      return nativeBalance ? nativeBalance.balance : '0'
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  },

  // Create and submit donation transaction
  async submitDonation(donorPublicKey, amount, campaignId) {
    try {
      const account = await server.loadAccount(donorPublicKey)
      
      // Build transaction (simplified - in production, call smart contract)
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: CONTRACT_ID, // In production: contract address
            asset: StellarSdk.Asset.native(),
            amount: amount.toString()
          })
        )
        .setTimeout(30)
        .build()

      // Get XDR
      const xdr = transaction.toXDR()

      // Sign with Freighter
      const signedXdr = await freighterApi.signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: NETWORK_PASSPHRASE
      })

      // Reconstruct and submit
      const signedTransaction = new StellarSdk.Transaction(signedXdr, NETWORK_PASSPHRASE)
      const result = await server.submitTransaction(signedTransaction)

      return {
        hash: result.hash,
        success: true
      }
    } catch (error) {
      console.error('Error submitting donation:', error)
      throw error
    }
  },

  // Invoke smart contract function
  async invokeContract(publicKey, functionName, params = []) {
    try {
      if (!CONTRACT_ID) {
        throw new Error('Contract ID not configured')
      }

      const account = await server.loadAccount(publicKey)
      
      // Build contract invocation (simplified)
      // In production, use proper contract invocation
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE * 10,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .setTimeout(30)
        .build()

      const xdr = transaction.toXDR()

      // Sign with Freighter
      const signedXdr = await freighterApi.signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: NETWORK_PASSPHRASE
      })

      // Submit
      const signedTransaction = new StellarSdk.Transaction(signedXdr, NETWORK_PASSPHRASE)
      const result = await server.submitTransaction(signedTransaction)

      return {
        hash: result.hash,
        success: true
      }
    } catch (error) {
      console.error('Error invoking contract:', error)
      throw error
    }
  },

  // Get transaction details
  async getTransaction(txHash) {
    try {
      return await server.transactions().transaction(txHash).call()
    } catch (error) {
      console.error('Error getting transaction:', error)
      throw error
    }
  },

  // Stream transactions for an account
  streamTransactions(publicKey, onTransaction) {
    return server
      .transactions()
      .forAccount(publicKey)
      .cursor('now')
      .stream({
        onmessage: onTransaction,
        onerror: (error) => console.error('Stream error:', error)
      })
  },

  // Format amount (stroops to XLM)
  stroopsToXLM(stroops) {
    return (Number(stroops) / 10000000).toFixed(7)
  },

  // Format amount (XLM to stroops)
  xlmToStroops(xlm) {
    return Math.floor(Number(xlm) * 10000000)
  }
}

export default stellarService
