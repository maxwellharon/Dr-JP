<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 p-4">
    <Transition name="modal" appear>
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 class="text-3xl font-bold text-center text-indigo-700 mb-6">Dr. JP Ogalo</h1>
        <div v-if="!isLogin" class="space-y-4">
          <input v-model="email" type="email" placeholder="Email" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none">
          <input v-model="password" type="password" placeholder="Password" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none">
          <button @click="signUp" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition">Sign Up</button>
          <p class="text-center text-sm">Already have an account? <button @click="isLogin=true" class="text-indigo-600 font-medium">Login</button></p>
        </div>
        <div v-else class="space-y-4">
          <input v-model="email" type="email" placeholder="Email" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none">
          <input v-model="password" type="password" placeholder="Password" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none">
          <button @click="login" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition">Login</button>
          <p class="text-center text-sm">New user? <button @click="isLogin=false" class="text-indigo-600 font-medium">Create account</button></p>
        </div>
        <p v-if="errorMsg" class="text-red-500 text-sm mt-3 text-center">{{ errorMsg }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const errorMsg = ref('')
const router = useRouter()

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    errorMsg.value = err.message
  }
}

const signUp = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    errorMsg.value = err.message
  }
}
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.3s ease-out;
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
</style>