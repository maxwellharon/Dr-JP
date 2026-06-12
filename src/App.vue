<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-indigo-600">Loading app...</p>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gray-50">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>

    <div v-if="seeding" class="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      Seeding master data...
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useAuth } from './stores/auth'
import { useMasterData } from './composables/useMasterData'

const { user, loading } = useAuth()
const { seedAllIfNeeded, loading: seeding } = useMasterData()

watch(user, async (newUser) => {
  if (newUser) {
    console.log('🔄 Starting seed...')
    await seedAllIfNeeded()
    console.log('✅ Seed completed')
  }
}, { immediate: true })
</script>