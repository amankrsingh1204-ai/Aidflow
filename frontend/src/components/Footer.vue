<template>
  <footer class="bg-gray-900 text-white mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
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
            <span class="text-2xl font-bold">AidFlow</span>
          </div>
          <p class="text-gray-400 mb-4 max-w-md">
            Blockchain-powered NGO donation platform on Stellar network. Transparent, secure, and efficient charitable giving.
          </p>
          <div class="flex space-x-4">
            <a href="https://github.com" target="_blank" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><router-link to="/campaigns" class="text-gray-400 hover:text-white transition-colors">Browse Campaigns</router-link></li>
            <li><router-link to="/organizations" class="text-gray-400 hover:text-white transition-colors">NGOs</router-link></li>
            <li><router-link to="/create-campaign" class="text-gray-400 hover:text-white transition-colors">Create Campaign</router-link></li>
            <li><router-link to="/about" class="text-gray-400 hover:text-white transition-colors">About Us</router-link></li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Resources</h3>
          <ul class="space-y-2">
            <li><a href="https://www.freighter.app/" target="_blank" class="text-gray-400 hover:text-white transition-colors">Get Freighter Wallet</a></li>
            <li><a href="https://www.stellar.org/" target="_blank" class="text-gray-400 hover:text-white transition-colors">Stellar Network</a></li>
            <li><a href="https://soroban.stellar.org/" target="_blank" class="text-gray-400 hover:text-white transition-colors">Soroban Docs</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {{ currentYear }} AidFlow. Built with ❤️ on Stellar.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
