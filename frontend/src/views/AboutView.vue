<template>
  <div class="about-view py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold mb-8 text-white">About AidFlow</h1>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-xl text-white mb-8">
          AidFlow is a blockchain-powered donation platform that brings transparency and trust to charitable giving.
        </p>

        <h2 class="text-white">Our Mission</h2>
        <p class="text-white">
          To revolutionize charitable donations by leveraging blockchain technology, ensuring every donation is transparent, traceable, and reaches its intended destination.
        </p>

        <h2 class="text-white">How It Works</h2>
        <ul class="text-white">
          <li>NGOs create verified campaigns on the platform</li>
          <li>Donors connect their Freighter wallet</li>
          <li>Donations are processed through Stellar blockchain</li>
          <li>All transactions are publicly auditable</li>
          <li>Multi-signature approvals for fund disbursements</li>
        </ul>

        <h2 class="text-white">Technology</h2>
        <p class="text-white">Built on:</p>
        <ul class="text-white">
          <li><strong>Stellar Blockchain</strong> - Fast, low-cost transactions</li>
          <li><strong>Soroban Smart Contracts</strong> - Secure fund management</li>
          <li><strong>Freighter Wallet</strong> - Easy wallet integration</li>
          <li><strong>Vue 3</strong> - Modern frontend framework</li>
          <li><strong>Rust/Axum</strong> - High-performance backend</li>
        </ul>

        <h2 class="text-white">Contact Us</h2>
        <p class="text-white">
          Have questions? Reach out to us at <a href="mailto:contact@aidflow.org" class="text-purple-400 hover:text-purple-300">contact@aidflow.org</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// About page content
</script>

<style scoped>
.prose h2 {
  @apply text-2xl font-bold mt-8 mb-4;
  color: white !important;
}

.prose p {
  @apply mb-4;
  color: white !important;
}

.prose ul {
  @apply list-disc list-inside mb-4;
  color: white !important;
}

.prose ul li {
  @apply mb-2;
  color: white !important;
}

.prose a {
  color: #a78bfa !important;
}

.prose a:hover {
  color: #c4b5fd !important;
}
</style>
