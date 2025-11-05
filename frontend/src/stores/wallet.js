import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import freighterApi from '@stellar/freighter-api'

export const useWalletStore = defineStore('wallet', () => {
  // State
  const isConnected = ref(false)
  const publicKey = ref(null)
  const network = ref('TESTNET')
  const isFreighterInstalled = ref(false)

  // Computed
  const shortAddress = computed(() => {
    if (!publicKey.value) return ''
    return `${publicKey.value.slice(0, 4)}...${publicKey.value.slice(-4)}`
  })

  // Actions
  const checkFreighterInstalled = async () => {
    try {
      const installed = await freighterApi.isConnected()
      isFreighterInstalled.value = installed
      return installed
    } catch (error) {
      console.error('Error checking Freighter:', error)
      isFreighterInstalled.value = false
      return false
    }
  }

  const connectWallet = async () => {
    try {
      const installed = await checkFreighterInstalled()
      
      if (!installed) {
        throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/')
      }

      // Request access to wallet
      const publicKeyResult = await freighterApi.getPublicKey()
      
      if (publicKeyResult) {
        publicKey.value = publicKeyResult
        isConnected.value = true
        
        // Get network
        const networkResult = await freighterApi.getNetwork()
        network.value = networkResult
        
        // Store in localStorage
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletPublicKey', publicKeyResult)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  const disconnectWallet = () => {
    isConnected.value = false
    publicKey.value = null
    
    // Clear localStorage
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletPublicKey')
  }

  const signTransaction = async (xdr) => {
    try {
      if (!isConnected.value) {
        throw new Error('Wallet not connected')
      }

      const signedXdr = await freighterApi.signTransaction(xdr, {
        network: network.value,
        networkPassphrase: network.value === 'TESTNET' 
          ? 'Test SDF Network ; September 2015'
          : 'Public Global Stellar Network ; September 2015'
      })

      return signedXdr
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  }

  const requestNetwork = async () => {
    try {
      const networkResult = await freighterApi.getNetwork()
      network.value = networkResult
      return networkResult
    } catch (error) {
      console.error('Error requesting network:', error)
      throw error
    }
  }

  // Initialize from localStorage
  const initializeFromStorage = async () => {
    const wasConnected = localStorage.getItem('walletConnected')
    const storedPublicKey = localStorage.getItem('walletPublicKey')
    
    if (wasConnected === 'true' && storedPublicKey) {
      try {
        await checkFreighterInstalled()
        if (isFreighterInstalled.value) {
          publicKey.value = storedPublicKey
          isConnected.value = true
          await requestNetwork()
        }
      } catch (error) {
        console.error('Error initializing from storage:', error)
        disconnectWallet()
      }
    }
  }

  return {
    // State
    isConnected,
    publicKey,
    network,
    isFreighterInstalled,
    // Computed
    shortAddress,
    // Actions
    checkFreighterInstalled,
    connectWallet,
    disconnectWallet,
    signTransaction,
    requestNetwork,
    initializeFromStorage
  }
})
