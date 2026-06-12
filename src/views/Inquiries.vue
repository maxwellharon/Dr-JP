<template>
  <div>
    <NavBar />
    <div class="p-4 md:p-6 max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">📩 Contact Inquiries</h2>

      <div v-if="inquiries.length === 0" class="text-center py-12 text-slate-400">
        No inquiries found.
      </div>

      <div v-else class="overflow-x-auto bg-white rounded-2xl shadow">
        <table class="min-w-full">
          <thead class="bg-slate-100">
            <tr>
              <th class="px-5 py-3 text-left">Date</th>
              <th class="px-5 py-3 text-left">Email</th>
              <th class="px-5 py-3 text-left">Subject</th>
              <th class="px-5 py-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inq in paginatedInquiries" :key="inq.id" class="border-b hover:bg-slate-50 transition">
              <td class="px-5 py-3">{{ formatDate(inq.createdDate) }}</td>
              <td class="px-5 py-3">{{ inq.email }}</td>
              <td class="px-5 py-3 font-medium">{{ inq.subject }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ inq.message || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="inquiries.length > 0" class="mt-6">
        <Pagination :current-page="currentPage" :total-pages="totalPages" @page-change="page => currentPage = page" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMasterData } from '../composables/useMasterData'
import NavBar from '../components/NavBar.vue'
import Pagination from '../components/Pagination.vue'

const { getInquiries } = useMasterData()
const inquiries = ref(getInquiries())   // static array from master data

const currentPage = ref(1)
const pageSize = 8

const totalPages = computed(() => Math.ceil(inquiries.value.length / pageSize) || 1)

const paginatedInquiries = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return inquiries.value.slice(start, start + pageSize)
})

const formatDate = (isoString) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
</script>