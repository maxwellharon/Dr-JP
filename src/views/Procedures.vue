<template>
  <NavBar />
  <div class="p-4 md:p-6 max-w-7xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">📋 Procedure Catalog</h2>

    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <template v-else>
      <div v-if="procedures.length === 0" class="text-center py-12 text-slate-400">
        No procedures found.
      </div>
      <div v-else class="overflow-x-auto bg-white rounded-2xl shadow">
        <table class="min-w-full">
          <thead class="bg-slate-100">
            <tr>
              <th class="px-5 py-3 text-left">Title</th>
              <th class="px-5 py-3 text-left">Category</th>
              <th class="px-5 py-3 text-left">Price Range (KES)</th>
              <th class="px-5 py-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proc in procedures" :key="proc.id" class="border-b hover:bg-slate-50 transition">
              <td class="px-5 py-3 font-medium">{{ proc.procedureName }}</td>
              <td class="px-5 py-3">{{ proc.category }}</td>
              <td class="px-5 py-3">{{ formatPrice(proc.minPrice) }} – {{ formatPrice(proc.maxPrice) }}</td>
              <td class="px-5 py-3 text-sm text-gray-600">{{ proc.description || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useWixData } from '../composables/useWixData'
import NavBar from '../components/NavBar.vue'

const { procedures, loading } = useWixData()

const formatPrice = (price) => new Intl.NumberFormat('en-KE').format(price || 0)
</script>