<template>
  <nav class="bg-white shadow-md px-4 md:px-6 py-3">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <router-link to="/dashboard" class="text-indigo-700 font-bold text-xl">Dr. Ogalo</router-link>
      
      <button @click="mobileOpen = !mobileOpen" class="md:hidden text-indigo-700">
        <i class="fas fa-bars text-2xl"></i>
      </button>

      <div class="hidden md:flex items-center gap-6 font-medium text-indigo-700">
        <router-link to="/dashboard" class="hover:text-indigo-900 transition">📊 Dashboard</router-link>
        <router-link to="/patients" class="hover:text-indigo-900 transition">👥 Patients</router-link>
        <router-link to="/procedures" class="hover:text-indigo-900 transition">📋 Procedures</router-link>
        <router-link to="/inquiries" class="hover:text-indigo-900 transition">📩 Inquiries</router-link>
        <router-link to="/analytics" class="hover:text-indigo-900 transition">🤖 AI Analytics</router-link>
        <button @click="logout" class="ml-4 text-red-500 hover:text-red-700 transition"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="md:hidden mt-3 flex flex-col gap-3 pb-2 font-medium text-indigo-700">
        <router-link to="/dashboard" @click="mobileOpen = false" class="hover:text-indigo-900 transition">📊 Dashboard</router-link>
        <router-link to="/patients" @click="mobileOpen = false" class="hover:text-indigo-900 transition">👥 Patients</router-link>
        <router-link to="/procedures" @click="mobileOpen = false" class="hover:text-indigo-900 transition">📋 Procedures</router-link>
        <router-link to="/inquiries" @click="mobileOpen = false" class="hover:text-indigo-900 transition">📩 Inquiries</router-link>
        <router-link to="/analytics" @click="mobileOpen = false" class="hover:text-indigo-900 transition">🤖 AI Analytics</router-link>
        <button @click="logout" class="text-red-500 hover:text-red-700 transition text-left"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'

const router = useRouter()
const mobileOpen = ref(false)

const logout = async () => {
  await signOut(auth)
  router.push('/login')
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  overflow: hidden;
}
</style>