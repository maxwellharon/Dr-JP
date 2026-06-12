<template>
  <NavBar />
  <div class="p-4 md:p-6 max-w-7xl mx-auto">
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <h2 class="text-2xl font-bold">👥 Patient Records</h2>
      <button @click="showUpload = true" class="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition">
        <i class="fas fa-upload"></i> Upload Data
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        <input 
          v-model="search" 
          placeholder="Search by name, email, or procedure..." 
          class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
        />
      </div>
      <select v-model="procFilter" class="border p-3 rounded-xl bg-white">
        <option value="">All Procedures</option>
        <option v-for="p in uniqueProcedures" :key="p" :value="p">{{ p }}</option>
      </select>
      <button @click="clearFilters" class="bg-gray-200 px-5 rounded-xl hover:bg-gray-300 transition">Clear</button>
    </div>

    <!-- Table / Card view -->
    <ResponsiveTable :headers="headers" :data="paginatedPatients" :actions="true" @view="goToPatient" @delete="deletePatient" />

    <!-- Pagination -->
    <div class="mt-6">
      <Pagination :current-page="currentPage" :total-pages="totalPages" @page-change="page => currentPage = page" />
    </div>
  </div>

  <Teleport to="body">
    <UploadModal v-if="showUpload" @close="showUpload = false" @uploaded="showUpload = false" />
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirestore } from '../composables/useFirestore'
import NavBar from '../components/NavBar.vue'
import ResponsiveTable from '../components/ResponsiveTable.vue'
import Pagination from '../components/Pagination.vue'
import UploadModal from '../components/UploadModal.vue'

const router = useRouter()
const { patients, deletePatient } = useFirestore()

const search = ref('')
const procFilter = ref('')
const showUpload = ref(false)
const currentPage = ref(1)
const pageSize = 8

const uniqueProcedures = computed(() => [...new Set(patients.value.map(p => p.selectedProcedure).filter(Boolean))])

const filteredPatients = computed(() => {
  let list = patients.value
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(p => 
      p.name?.toLowerCase().includes(s) || 
      p.email?.toLowerCase().includes(s) || 
      p.selectedProcedure?.toLowerCase().includes(s) ||
      p.phone?.includes(s)
    )
  }
  if (procFilter.value) list = list.filter(p => p.selectedProcedure === procFilter.value)
  return list
})

const totalPages = computed(() => Math.ceil(filteredPatients.value.length / pageSize) || 1)

const paginatedPatients = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPatients.value.slice(start, start + pageSize)
})

const clearFilters = () => {
  search.value = ''
  procFilter.value = ''
  currentPage.value = 1
}

const headers = ['Name', 'Procedure', 'Age', 'Phone', 'Price (KES)']

const goToPatient = (patient) => {
  router.push(`/patients/${patient.id}`)
}
</script>