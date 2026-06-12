<template>
  <div>
    <NavBar />
    <div class="p-4 md:p-6 max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">📋 Procedure Catalog</h2>

      <div class="overflow-x-auto bg-white rounded-2xl shadow">
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
            <tr
              v-for="proc in procedures"
              :key="proc.procedureName"
              class="border-b hover:bg-slate-50 transition"
            >
              <td class="px-5 py-3 font-medium">{{ proc.procedureName }}</td>
              <td class="px-5 py-3">{{ proc.category }}</td>
              <td class="px-5 py-3">
                {{ formatPrice(proc.minPrice) }} – {{ formatPrice(proc.maxPrice) }}
              </td>
              <td class="px-5 py-3 text-sm text-gray-600">
                {{ proc.description || '—' }}
              </td>
            </tr>
            <tr v-if="!procedures.length">
              <td colspan="4" class="text-center py-12 text-slate-400">
                No procedures found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMasterData } from '../composables/useMasterData'
import NavBar from '../components/NavBar.vue'

const { getProcedures } = useMasterData()
const procedures = getProcedures()   // already an array, no ref needed

const formatPrice = (price) => new Intl.NumberFormat('en-KE').format(price || 0)
</script>