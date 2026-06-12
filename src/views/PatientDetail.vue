<template>
  <NavBar />
  <div class="p-4 md:p-6 max-w-5xl mx-auto">
    <router-link to="/patients" class="text-indigo-600 hover:underline inline-flex items-center gap-1 mb-4">
      <i class="fas fa-arrow-left"></i> Back to Patients
    </router-link>
    <Transition name="fade" appear>
      <div v-if="patient" class="bg-white rounded-2xl shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold">{{ patient.name }}</h1>
              <p class="text-indigo-100 mt-1">{{ patient.email }}</p>
            </div>
            <div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              ID: {{ patient.id }}
            </div>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-50 rounded-xl p-5 shadow-sm">
            <h3 class="font-bold text-lg border-b pb-2 mb-4"><i class="fas fa-user mr-2"></i>Personal Details</h3>
            <dl class="space-y-3">
              <div class="flex justify-between"><dt class="text-slate-500">Full Name:</dt><dd class="font-medium">{{ patient.name }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Email:</dt><dd class="font-medium">{{ patient.email }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Phone:</dt><dd class="font-medium text-indigo-700">{{ patient.phone || '—' }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Age:</dt><dd class="font-medium">{{ patient.age }} years</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Country:</dt><dd class="font-medium">{{ patient.Country || 'Kenya' }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">BMI:</dt><dd class="font-medium">{{ patient.bmi || '—' }}</dd></div>
            </dl>
          </div>
          <div class="bg-slate-50 rounded-xl p-5 shadow-sm">
            <h3 class="font-bold text-lg border-b pb-2 mb-4"><i class="fas fa-procedures mr-2"></i>Procedure Details</h3>
            <dl class="space-y-3">
              <div class="flex justify-between"><dt class="text-slate-500">Procedure:</dt><dd class="font-medium">{{ patient.selectedProcedure || '—' }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Type:</dt><dd :class="patient.isNonSurgical ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ patient.isNonSurgical ? 'Non‑Surgical' : 'Surgical' }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Price:</dt><dd class="font-bold text-indigo-700">{{ formatPrice(patient.calculatedPrice) }} KES</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Registered:</dt><dd class="font-medium">{{ formatDate(patient.createdDate) }}</dd></div>
            </dl>
          </div>
          <div class="md:col-span-2 bg-indigo-50 rounded-xl p-5 shadow-sm">
            <h3 class="font-bold text-lg mb-2"><i class="fas fa-lightbulb mr-2"></i>Smart Insight</h3>
            <p class="text-slate-700">Based on similar patients, {{ patient.name }} might benefit from a follow‑up consultation in 3–6 months. Patients who had {{ patient.selectedProcedure }} reported high satisfaction with our post‑op care.</p>
          </div>
        </div>
      </div>
      <div v-else class="bg-white rounded-2xl shadow p-8 text-center text-slate-500">Patient not found.</div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFirestore } from '../composables/useFirestore'
import NavBar from '../components/NavBar.vue'

const route = useRoute()
const { patients } = useFirestore()
const patient = computed(() => patients.value.find(p => p.id === route.params.id) || null)

const formatPrice = (price) => {
  if (!price) return '—'
  return new Intl.NumberFormat('en-KE').format(price)
}

const formatDate = (isoString) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<style scoped>
.fade-enter-active { transition: opacity 0.3s ease; }
.fade-enter-from { opacity: 0; }
</style>