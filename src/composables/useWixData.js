import { ref, onMounted } from 'vue'

const patients = ref([])
const inquiries = ref([])
const procedures = ref([])
const loading = ref(false)
const error = ref(null)

const COLLECTIONS = {
    patients: 'QuoteSubmissions',           // ✅ Working (50 records)
    inquiries: 'Send us a message and we’ll get back to you shortly.', // Try this first
    // inquiries: 'Send us a message and we’ll get back to you shortly. 2', // Alternative
    procedures: 'Procedures'
}

async function fetchCollection(collectionKey) {
    const wixId = COLLECTIONS[collectionKey]
    console.log(`Fetching: ${collectionKey} → "${wixId}"`)

    const res = await fetch(`/api/wix-data?collection=${encodeURIComponent(wixId)}`)

    if (!res.ok) {
        console.error(`❌ Failed ${collectionKey}: HTTP ${res.status}`)
        return [] // Don't crash the whole app
    }

    const json = await res.json()
    return json.dataItems || json.items || []
}

function mapPatient(item) {
    return {
        id: item._id,
        name: item.name || item.fullName || item.title || 'Unknown',
        email: item.email || '',
        phone: item.phone || '',
        age: Number(item.age) || null,
        Country: item.Country || item.country || 'Kenya',
        selectedProcedure: item.selectedProcedure || item.procedure || 'Consultation',
        isNonSurgical: Boolean(item.isNonSurgical),
        bmi: Number(item.bmi) || null,
        calculatedPrice: Number(item.calculatedPrice || item.price) || 0,
        createdDate: item._createdDate || item.createdDate
    }
}

async function loadAll() {
    loading.value = true
    try {
        const [rawPatients, rawInquiries, rawProcedures] = await Promise.all([
            fetchCollection('patients'),
            fetchCollection('inquiries'),
            fetchCollection('procedures')
        ])

        patients.value = rawPatients.map(mapPatient)
        inquiries.value = rawInquiries
        procedures.value = rawProcedures

        console.log(`✅ Real Data Loaded | Patients: ${patients.value.length} | Inquiries: ${inquiries.value.length}`)
    } catch (e) {
        console.error('Load error:', e)
    } finally {
        loading.value = false
    }
}

export function useWixData() {
    onMounted(loadAll)
    return {
        patients,
        inquiries,
        procedures,
        loading,
        error,
        refresh: loadAll
    }
}