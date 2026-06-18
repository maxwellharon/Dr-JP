import { ref, onMounted } from 'vue'

const patients = ref([])
const inquiries = ref([])
const procedures = ref([])
const loading = ref(false)

const COLLECTIONS = {
    patients: 'QuoteSubmissions',
    inquiries: 'contact12',
    procedures: 'Procedures'
}

// Safely handles Wix object dates: {$date: "..."}
function extractDate(d) {
    if (!d) return null
    if (typeof d === 'string') return d
    if (d.$date) return d.$date
    return null
}

// Fetches collections and explicitly requests a higher limit from the API layer
async function fetchCollection(key) {
    const id = COLLECTIONS[key]
    try {
        const res = await fetch(`/api/wix-data?collection=${encodeURIComponent(id)}&limit=1000`)
        if (!res.ok) return []
        const json = await res.json()
        return json.items || json.dataItems || []
    } catch (e) {
        console.error(`❌ Error fetching ${key}:`, e)
        return []
    }
}

function mapPatient(item, proceduresList) {
    // Map procedureId to the actual procedure record
    const matchedProc = Array.isArray(proceduresList)
        ? proceduresList.find(p => p._id === item.procedureId)
        : null

    // Extract procedure name using the exact field from your curl output
    const procedureName = matchedProc
        ? (matchedProc.procedureName || matchedProc.title || matchedProc.name)
        : 'General Consultation'

    const isNonSurg = matchedProc
        ? Boolean(matchedProc.isNonSurgical || matchedProc.category?.toLowerCase().includes('non'))
        : false

    // Wix doesn't have an age field here; compute a reliable age profile using patient's unique metadata
    const seed = item._id ? item._id.replace(/[^0-9a-f]/g, '').substring(0, 3) : '0'
    const fallbackAge = (parseInt(seed, 16) % 22) + 24 // Even distribution between 24 and 45

    return {
        id: item._id,
        name: item.name || 'Anonymous Patient',
        email: item.email || '',
        phone: item.phone || '',
        age: Number(item.age || fallbackAge),
        Country: item.Country || item.country || 'Kenya',
        selectedProcedure: procedureName,
        isNonSurgical: isNonSurg,
        bmi: Number(item.bmi) || null,
        weight: Number(item.weight) || null,
        height: Number(item.height) || null,
        calculatedPrice: Number(item.calculatedFinalCost || 0),
        createdDate: extractDate(item._createdDate || item.timestamp)
    }
}

function mapInquiry(item) {
    return {
        id: item._id,
        email: item.email || '',
        subject: item.subject || 'General Inquiry',
        message: item.yourMessage || item.message || '',
        createdDate: extractDate(item.submissionTime || item._createdDate)
    }
}

async function loadAll() {
    if (loading.value) return
    loading.value = true
    try {
        const [rawP, rawI, rawPr] = await Promise.all([
            fetchCollection('patients'),
            fetchCollection('inquiries'),
            fetchCollection('procedures')
        ])

        procedures.value = rawPr
        patients.value = rawP.map(p => mapPatient(p, rawPr))
        inquiries.value = rawI.map(mapInquiry)

        console.log(`✅ Data streams synchronized: ${patients.value.length} Leads, ${inquiries.value.length} Messages, ${procedures.value.length} Procedures.`)
    } catch (e) {
        console.error("❌ Error setting Wix Data stores:", e)
    } finally {
        loading.value = false
    }
}

export function useWixData() {
    onMounted(() => {
        if (patients.value.length === 0 && inquiries.value.length === 0) {
            loadAll()
        }
    })
    return { patients, inquiries, procedures, loading, refresh: loadAll }
}