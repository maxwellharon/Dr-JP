<template>
  <div>
    <NavBar />
    <div class="p-4 md:p-6 max-w-7xl mx-auto">
      <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 class="text-2xl font-bold">📩 Contact Inquiries</h2>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-400">Loading inquiries...</div>

      <div v-else-if="!inquiries.length" class="text-center py-12 text-slate-400">
        No inquiries found.
      </div>

      <div v-else class="overflow-x-auto bg-white rounded-2xl shadow">
        <ResponsiveTable 
          :headers="['Date', 'Email', 'Subject', 'Message']" 
          :data="paginatedInquiries" 
          :custom-render="true"
        >
          <template #row="{ item }">
            <td class="px-5 py-3">{{ formatDate(item.createdDate) }}</td>
            <td class="px-5 py-3">{{ item.email }}</td>
            <td class="px-5 py-3 font-medium">{{ item.subject }}</td>
            <td class="px-5 py-3 text-sm text-gray-600">{{ item.message || '—' }}</td>
          </template>
        </ResponsiveTable>
        <button @click="manualSeed" class="bg-green-600 text-white px-4 py-2 rounded-xl">Force Seed Inquiries</button>
      </div>

      <div v-if="inquiries.length" class="mt-6">
        <Pagination :current-page="currentPage" :total-pages="totalPages" @page-change="page => currentPage = page" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFirestore } from '../composables/useFirestore'
import { useMasterData } from '../composables/useMasterData'
import NavBar from '../components/NavBar.vue'
import Pagination from '../components/Pagination.vue'

const { inquiries, bulkUpload } = useFirestore()
const { getInquiries } = useMasterData()

const currentPage = ref(1)
const pageSize = 8
const isLoaded = ref(false)

// Debug: log inquiries whenever they change
watch(inquiries, (val) => {
  console.log('📩 inquiries updated:', val.length, 'items')
  if (val.length > 0) isLoaded.value = true
}, { immediate: true })

// Fallback if empty after 4 seconds
setTimeout(() => { isLoaded.value = true }, 4000)

const totalPages = computed(() => Math.ceil(inquiries.value.length / pageSize) || 1)
const paginatedInquiries = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return inquiries.value.slice(start, start + pageSize)
})
const handlePageChange = (page) => { currentPage.value = page }
const formatDate = (isoString) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Manual seed function (run from a button in the template if you add one)
const manualSeed = async () => {
  await bulkUpload(getInquiries(), 'inquiries')
  console.log('✅ Manual seed complete')
}
</script>