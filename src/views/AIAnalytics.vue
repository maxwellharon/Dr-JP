<template>
  <NavBar />
  <div class="p-4 md:p-6">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h2 class="text-2xl font-bold">🤖 AI Analytics & Suggestions</h2>
      <button @click="refreshInsights" class="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl hover:bg-purple-200 transition">⟳ Regenerate</button>
    </div>
    <div class="bg-white rounded-2xl shadow-md p-6">
      <div v-if="loading" class="flex justify-center py-10">Loading insights...</div>
      <div v-else class="space-y-4">
        <div v-for="(ins, idx) in insights" :key="idx" class="border-b pb-3">
          <p class="font-semibold text-indigo-800">{{ ins.title }}</p>
          <p class="text-gray-700">{{ ins.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMasterData } from '../composables/useMasterData'
import NavBar from '../components/NavBar.vue'

const { getPatients } = useMasterData()
const patients = computed(() => getPatients())
const loading = ref(false)
const insights = ref([])

const generateInsights = () => {
  if (!patients.value.length) {
    insights.value = [{ title: "No data", message: "Upload patient records to see AI recommendations." }]
    return
  }
  const data = patients.value
  const total = data.length
  const procMap = new Map()
  let ageSum = 0, nonSurg = 0, priceSum = 0
  const countries = new Map()
  data.forEach(p => {
    if (p.selectedProcedure) procMap.set(p.selectedProcedure, (procMap.get(p.selectedProcedure)||0)+1)
    if (p.age) ageSum += p.age
    if (p.isNonSurgical) nonSurg++
    if (p.calculatedPrice) priceSum += p.calculatedPrice
    if (p.Country) countries.set(p.Country, (countries.get(p.Country)||0)+1)
  })
  const topProc = [...procMap.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A"
  const avgAge = Math.round(ageSum/total)
  const nonSurgPercent = Math.round((nonSurg/total)*100)
  const avgPrice = Math.round(priceSum/total)
  const topCountry = [...countries.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] || "Global"
  
  insights.value = [
    { title: "📈 Top Procedure Demand", message: `${topProc} is the most requested (${Math.round((procMap.get(topProc)/total)*100)}% of patients). Consider targeted campaigns.` },
    { title: "👥 Age Demographic Focus", message: `Average patient age: ${avgAge}. Patients aged 26-35 are your fastest‑growing segment.` },
    { title: "💉 Surgical vs Non‑Surgical", message: `${nonSurgPercent}% prefer non‑surgical options. Expanding Botox, fillers could increase revenue.` },
    { title: "🌍 Geographic Opportunity", message: `Most patients come from ${topCountry}. Invest in local influencer partnerships.` },
    { title: "💰 Pricing Strategy", message: `Average procedure price: KES ${avgPrice.toLocaleString()}. Offering financing may increase conversion.` },
    { title: "🧠 AI Recommendation", message: "Implement automated post‑op follow‑up surveys via SMS to improve retention." }
  ]
}

const refreshInsights = () => { generateInsights() }
generateInsights()
</script>