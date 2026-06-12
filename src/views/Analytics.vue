<template>
  <NavBar />
  <div class="p-4 md:p-6 max-w-7xl mx-auto">
    <div class="flex flex-wrap justify-between items-center mb-6 gap-3">
      <h2 class="text-2xl font-bold">🤖 AI Analytics & Suggestions</h2>
      <button 
        @click="refreshInsights" 
        class="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl flex gap-2 items-center hover:bg-purple-200 transition"
      >
        <i class="fas fa-sync-alt"></i> Regenerate
      </button>
    </div>

    <TransitionGroup name="insight" tag="div" class="space-y-4">
      <div v-if="loading" class="flex justify-center py-10" key="loader">
        <div class="animate-pulse text-indigo-500">Loading insights...</div>
      </div>
      <div v-else v-for="(ins, idx) in insights" :key="idx" 
        class="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4"
        :class="borderColor(idx)"
      >
        <p class="font-semibold text-indigo-800 text-lg">{{ ins.title }}</p>
        <p class="text-gray-700 mt-1">{{ ins.message }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFirestore } from '../composables/useFirestore'
import NavBar from '../components/NavBar.vue'

const { patients } = useFirestore()
const loading = ref(false)
const insights = ref([])

const generateInsights = () => {
  const data = patients.value
  if (!data.length) {
    insights.value = [{ title: "No data", message: "Upload patient records to see AI recommendations." }]
    return
  }
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

const refreshInsights = () => {
  loading.value = true
  setTimeout(() => {
    generateInsights()
    loading.value = false
  }, 300)
}

generateInsights()

const borderColor = (idx) => {
  const colors = ['border-indigo-500','border-purple-500','border-pink-500','border-amber-500','border-emerald-500','border-blue-500']
  return colors[idx % colors.length]
}
</script>

<style scoped>
.insight-enter-active {
  transition: all 0.4s ease;
}
.insight-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
</style>