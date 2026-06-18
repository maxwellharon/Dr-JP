<template>
  <div>
    <NavBar />
    <div class="p-4 md:p-6 max-w-7xl mx-auto">
      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else>
        <TransitionGroup name="list" tag="div" class="space-y-6">
          <StatsCards
            :total="totalPatients"
            :mostRequested="mostRequestedProc"
            :avgAge="averageAge"
            :nonSurgPercent="nonSurgicalPercent"
            key="stats"
          />

          <div class="grid md:grid-cols-2 gap-6" key="charts1">
            <AgeChart :data="ageDistribution" />
            <ProcedureChart :data="procedureData" />
          </div>

          <div class="grid md:grid-cols-2 gap-6" key="charts2">
            <CountryChart :data="countryDistribution" />
            <RegistrationsChart :data="registrationsTimeSeries" />
          </div>

          <div key="recent">
            <h3 class="font-bold text-xl mb-3">Recent Patients</h3>
            <ResponsiveTable
              :headers="patientHeaders"
              :data="recentPatients"
              :actions="true"
              @view="goToPatient"
            />
          </div>
        </TransitionGroup>
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
const { patients, loading } = useWixData()

// Safe fallback
const patientList = computed(() => patients.value || [])

const totalPatients = computed(() => patientList.value.length)

const mostRequestedProc = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    if (p.selectedProcedure) counts[p.selectedProcedure] = (counts[p.selectedProcedure] || 0) + 1
  })
  const entries = Object.entries(counts)
  if (!entries.length) return '—'
  return entries.sort((a, b) => b[1] - a[1])[0][0]
})

const averageAge = computed(() => {
  const ages = patientList.value.filter(p => p.age).map(p => p.age)
  if (!ages.length) return 0
  return Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
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
    const age = p.age
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
    if (p.selectedProcedure) counts[p.selectedProcedure] = (counts[p.selectedProcedure] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return {
    labels: sorted.map(e => e[0]),
    counts: sorted.map(e => e[1])
  }
})

const countryDistribution = computed(() => {
  const counts = {}
  patientList.value.forEach(p => {
    const c = p.Country || 'Unknown'
    counts[c] = (counts[c] || 0) + 1
  })
  return {
    labels: Object.keys(counts),
    values: Object.values(counts)
  }
})

const registrationsTimeSeries = computed(() => {
  const months = {}
  patientList.value.forEach(p => {
    if (p.createdDate) {
      const d = new Date(p.createdDate)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = (months[key] || 0) + 1
    }
  })
  const sortedKeys = Object.keys(months).sort()
  return {
    labels: sortedKeys,
    counts: sortedKeys.map(k => months[k])
  }
})

const recentPatients = computed(() => patientList.value.slice(0, 5))
const patientHeaders = ['Name', 'Procedure', 'Age', 'Country', 'Price (KES)']

const goToPatient = (patient) => {
  router.push(`/patients/${patient.id}`)
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
</style>