<template>
  <div>
    <NavBar />
    <div class="p-4 md:p-6 max-w-7xl mx-auto">
      
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else class="space-y-8">
        
        <StatsCards 
          :total="totalPatients" 
          :mostRequested="mostRequestedProc" 
          :avgAge="averageAge" 
          :nonSurgPercent="nonSurgicalPercent" 
        />

        <div class="grid md:grid-cols-2 gap-6">
          <AgeChart :data="ageDistribution" />
          <ProcedureChart :data="procedureData" />
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <CountryChart :data="countryDistribution" />
          <RegistrationsChart :data="registrationsTimeSeries" />
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-xl text-gray-800">Quote Submissions Pipeline ({{ totalPatients }})</h3>
            </div>
            <ResponsiveTable 
              :headers="['Name', 'Procedure', 'Age', 'Country', 'Price (KES)']" 
              :data="recentPatients" 
              :actions="true" 
              @view="goToPatient" 
            />
          </div>

          <div class="space-y-4">
            <h3 class="font-bold text-xl text-gray-800">General Messages ({{ totalInquiries }})</h3>
            <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-[420px] overflow-y-auto shadow-sm">
              <div v-if="recentInquiries.length === 0" class="p-6 text-center text-gray-400 text-sm">
                No new messages received.
              </div>
              <div v-for="inquiry in recentInquiries" :key="inquiry.id" class="p-4 hover:bg-gray-50 transition">
                <div class="flex justify-between items-start mb-1">
                  <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full truncate max-w-[180px]">
                    {{ inquiry.email }}
                  </span>
                  <span class="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                    {{ formatDate(inquiry.createdDate) }}
                  </span>
                </div>
                <h4 class="font-semibold text-sm text-gray-900 truncate">{{ inquiry.subject }}</h4>
                <p class="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{{ inquiry.message }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWixData } from '../composables/useWixData'
import NavBar from '../components/NavBar.vue'
import StatsCards from '../components/StatsCards.vue'
import AgeChart from '../components/AgeChart.vue'
import ProcedureChart from '../components/ProcedureChart.vue'
import CountryChart from '../components/CountryChart.vue'
import RegistrationsChart from '../components/RegistrationsChart.vue'
import ResponsiveTable from '../components/ResponsiveTable.vue'

const router = useRouter()
const { patients, inquiries, loading } = useWixData()

// Computed transformations for Quote Submissions (patients)
const patientList = computed(() => patients.value || [])
const totalPatients = computed(() => patientList.value.length)

// Computed transformations for Contact Enquiries (contact12)
const inquiryList = computed(() => inquiries.value || [])
const totalInquiries = computed(() => inquiryList.value.length)

const mostRequestedProc = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    const proc = p.selectedProcedure
    if (proc) counts[proc] = (counts[proc] || 0) + 1
  })
  const top = Object.entries(counts).sort((a,b) => b[1] - a[1])[0]
  return top ? top[0] : '—'
})

const averageAge = computed(() => {
  const ages = patientList.value.filter(p => p.age > 0).map(p => p.age)
  return ages.length ? Math.round(ages.reduce((a,b) => a + b, 0) / ages.length) : 0
})

const nonSurgicalPercent = computed(() => {
  const total = patientList.value.length
  if (!total) return 0
  const nonSurg = patientList.value.filter(p => p.isNonSurgical).length
  return Math.round((nonSurg / total) * 100)
})

const ageDistribution = computed(() => {
  const groups = [0, 0, 0, 0]
  patientList.value.forEach(p => {
    const age = Number(p.age)
    if (age >= 18 && age <= 25) groups[0]++
    else if (age >= 26 && age <= 35) groups[1]++
    else if (age >= 36 && age <= 50) groups[2]++
    else if (age > 50) groups[3]++
  })
  return groups
})

const procedureData = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    const proc = p.selectedProcedure || 'Consultation'
    counts[proc] = (counts[proc] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1])
  return { labels: sorted.map(e => e[0]), counts: sorted.map(e => e[1]) }
})

const countryDistribution = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    const c = p.Country || 'Kenya'
    counts[c] = (counts[c] || 0) + 1
  })
  return { labels: Object.keys(counts), values: Object.values(counts) }
})

const registrationsTimeSeries = computed(() => {
  const months = {}
  patientList.value.forEach(p => {
    if (p.createdDate) {
      const d = new Date(p.createdDate)
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
        months[key] = (months[key] || 0) + 1
      }
    }
  })
  const sortedKeys = Object.keys(months).sort()
  return { labels: sortedKeys, counts: sortedKeys.map(k => months[k]) }
})

const recentPatients = computed(() => patientList.value.slice(0, 7))
const recentInquiries = computed(() => inquiryList.value.slice(0, 10))

const goToPatient = (patient) => router.push(`/patients/${patient.id}`)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}
</script>