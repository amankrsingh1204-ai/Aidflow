<template>
  <nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <svg class="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Orange Heart-shaped Chain Link -->
            <path d="M 30 45 C 30 35, 35 30, 42 30 C 47 30, 50 33, 50 38 C 50 33, 53 30, 58 30 C 65 30, 70 35, 70 45 C 70 55, 50 70, 50 70 C 50 70, 30 55, 30 45 Z" 
                  fill="none" 
                  stroke="#FF8C00" 
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
            
            <!-- Blue Chain Link -->
            <path d="M 35 25 C 35 25, 30 25, 30 30 C 30 35, 35 35, 35 35 M 65 25 C 65 25, 70 25, 70 30 C 70 35, 65 35, 65 35" 
                  fill="none" 
                  stroke="#1E90FF" 
                  stroke-width="6"
                  stroke-linecap="round"/>
            <path d="M 35 25 Q 50 15, 65 25" 
                  fill="none" 
                  stroke="#1E90FF" 
                  stroke-width="6"
                  stroke-linecap="round"/>
            <path d="M 35 35 Q 50 45, 65 35" 
                  fill="none" 
                  stroke="#1E90FF" 
                  stroke-width="6"
                  stroke-linecap="round"/>
          </svg>
          <span class="text-xl font-bold text-gray-900">AidFlow</span>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/campaigns" class="nav-link">Campaigns</router-link>
          <router-link to="/organizations" class="nav-link">NGOs</router-link>
          <router-link to="/about" class="nav-link">About</router-link>
        </div>

        <!-- Wallet Connection -->
        <div class="flex items-center space-x-4">
          <!-- Create Campaign Button (only if connected) -->
          <router-link
            v-if="walletStore.isConnected"
            to="/create-campaign"
            class="hidden md:block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Campaign
          </router-link>

          <!-- Wallet Button -->
          <button
            v-if="!walletStore.isConnected"
            @click="connectWallet"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>Connect Wallet</span>
          </button>

          <!-- Connected Wallet -->
          <div v-else class="relative" ref="walletMenuRef">
            <button
              @click="toggleWalletMenu"
              class="wallet-connected px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center space-x-2 border border-green-500"
            >
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-mono">{{ walletStore.shortAddress }}</span>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showWalletMenu"
              class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200">
                <p class="text-xs text-gray-500">Wallet Address</p>
                <p class="text-sm font-mono break-all">{{ walletStore.publicKey }}</p>
                <p class="text-xs text-gray-500 mt-2">Network: {{ walletStore.network }}</p>
              </div>
              
              <router-link
                to="/my-donations"
                @click="closeWalletMenu"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                My Donations
              </router-link>

              <button
                @click="disconnect"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden py-4 space-y-2">
        <router-link to="/" @click="closeMobileMenu" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Home</router-link>
        <router-link to="/campaigns" @click="closeMobileMenu" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Campaigns</router-link>
        <router-link to="/organizations" @click="closeMobileMenu" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">NGOs</router-link>
        <router-link to="/about" @click="closeMobileMenu" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">About</router-link>
        <router-link v-if="walletStore.isConnected" to="/create-campaign" @click="closeMobileMenu" class="block px-4 py-2 text-green-600 font-medium hover:bg-green-50 rounded-lg">Create Campaign</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()
const showWalletMenu = ref(false)
const showMobileMenu = ref(false)
const walletMenuRef = ref(null)

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
  } catch (error) {
    alert(error.message || 'Failed to connect wallet')
  }
}

const disconnect = () => {
  walletStore.disconnectWallet()
  showWalletMenu.value = false
}

const toggleWalletMenu = () => {
  showWalletMenu.value = !showWalletMenu.value
}

const closeWalletMenu = () => {
  showWalletMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Close wallet menu when clicking outside
const handleClickOutside = (event) => {
  if (walletMenuRef.value && !walletMenuRef.value.contains(event.target)) {
    showWalletMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  walletStore.initializeFromStorage()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-blue-600 font-medium transition-colors;
}

.router-link-active.nav-link {
  @apply text-blue-600;
}
</style>
