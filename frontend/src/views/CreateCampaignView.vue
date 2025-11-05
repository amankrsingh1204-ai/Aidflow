<template>
  <div class="create-campaign-view py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold mb-8">Create New Campaign</h1>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-black mb-2">
              Campaign Name *
            </label>
            <input 
              v-model="form.name"
              type="text"
              required
              class="input-field"
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-black mb-2">
              Description *
            </label>
            <textarea 
              v-model="form.description"
              required
              rows="5"
              class="input-field"
              placeholder="Describe your campaign..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-black mb-2">
              Campaign Image (Optional)
            </label>
            <input 
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="input-field"
            />
            <p class="text-sm text-gray-600 mt-1">Upload an image for your campaign (JPG, PNG, GIF)</p>
            <div v-if="imagePreview" class="mt-4">
              <img :src="imagePreview" alt="Campaign preview" class="max-h-48 rounded-lg" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-black mb-2">
                Goal Amount (XLM) *
              </label>
              <input 
                v-model="form.goal_amount"
                type="number"
                required
                min="1"
                step="0.1"
                class="input-field"
                placeholder="1000"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-black mb-2">
                Deadline *
              </label>
              <input 
                v-model="form.deadline"
                type="date"
                required
                class="input-field"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-black mb-2">
              Category *
            </label>
            <select v-model="form.category" required class="input-field">
              <option value="">Select category</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Educational Fund">Educational Fund</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Community Development">Community Development</option>
              <option value="Environmental Conservation">Environmental Conservation</option>
              <option value="Food & Nutrition">Food & Nutrition</option>
              <option value="Child Welfare">Child Welfare</option>
              <option value="Women Empowerment">Women Empowerment</option>
              <option value="Animal Welfare">Animal Welfare</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="flex gap-4">
            <button 
              type="submit"
              :disabled="submitting"
              class="btn-primary flex-1"
            >
              {{ submitting ? 'Creating...' : 'Create Campaign' }}
            </button>
            <router-link to="/campaigns" class="btn-primary flex-1 flex items-center justify-center">
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '../stores/campaign'
import { useWalletStore } from '../stores/wallet'

const router = useRouter()
const campaignStore = useCampaignStore()
const walletStore = useWalletStore()

const form = ref({
  name: '',
  description: '',
  goal_amount: '',
  deadline: '',
  category: '',
  image: null
})

const imagePreview = ref(null)
const submitting = ref(false)

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
      form.value.image = e.target.result // Store as base64
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    // For demo purposes - create a mock campaign
    const mockCampaign = {
      id: Date.now().toString(),
      name: form.value.name,
      description: form.value.description,
      goal_amount: parseFloat(form.value.goal_amount),
      current_amount: 0,
      deadline: form.value.deadline,
      category: form.value.category,
      image: form.value.image, // Include the image
      status: 'Active',
      created_at: new Date().toISOString()
    }

    // Store in localStorage for demo
    const existingCampaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]')
    existingCampaigns.unshift(mockCampaign)
    localStorage.setItem('mockCampaigns', JSON.stringify(existingCampaigns))

    alert('Campaign created successfully!')
    router.push('/campaigns')
  } catch (error) {
    console.error('Error creating campaign:', error)
    alert('Failed to create campaign: ' + error.message)
  } finally {
    submitting.value = false
  }
}
  } catch (error) {
    console.error('Error creating campaign:', error)
    alert('Failed to create campaign: ' + error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!walletStore.isConnected) {
    alert('Please connect your wallet first')
    router.push('/')
  }
})
</script>
