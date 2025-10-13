<template>
    <BaseLayout>
        <div class="login-container">
            <h1 class="login-title">Iniciar sesión</h1>
            
            <v-text-field
                v-model="email"
                label="Ingrese su correo electrónico"
                type="email"
                variant="outlined"
                class="email-field"
            ></v-text-field>
            
            <v-text-field
                v-model="password"
                label="Ingrese su contraseña"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                class="email-field"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="togglePasswordVisibility"
            ></v-text-field>
            
            <div class="forgot-password">
                ¿Olvidó su contraseña? Haga click  
                <router-link to="/recuperar-contraseña" class="link-underline">aquí</router-link>
            </div>
            
            <v-alert
                v-if="errorMessage"
                type="error"
                class="mb-4"
            >
                {{ errorMessage }}
            </v-alert>
            
            <v-btn 
                class="login-btn" 
                @click="handleLogin"
                :loading="isLoading"
                :disabled="isLoading"
            >
                Iniciar sesión
            </v-btn>
            
            <div class="register-text">
                ¿No tiene cuenta? Registrese  
                <router-link to="/registro" class="link-underline">aquí</router-link>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { buildApiUrl, API_ENDPOINTS } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = 'Por favor complete todos los campos'
        return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        })

        if (response.status === 200) {
            const data = await response.json()
            
            authStore.setToken(data.token)
            
            email.value = ''
            password.value = ''
            
            router.push('/')
            
        } else if (response.status === 400) {
            errorMessage.value = 'Datos inválidos. Por favor revise la información ingresada.'
        } else if (response.status === 401) {
            errorMessage.value = 'Email o contraseña incorrectos.'
        } else if (response.status === 500) {
            errorMessage.value = 'Error interno del servidor. Intente nuevamente más tarde.'
        } else {
            errorMessage.value = 'Error inesperado. Intente nuevamente.'
        }
        
    } catch (error) {
        console.error('Error en login:', error)
        errorMessage.value = 'Error de conexión. Verifique su conexión a internet.'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-title {
    color: black;
    font-size: 2.5rem;
    font-weight: normal;
    margin-top: 15px;
    margin-bottom: 32px;
    text-align: center;
}

.email-field {
    width: 75%;
    height: 20px;
    margin-bottom: 50px;
    border: none;
}

:deep(.email-field .v-field),
:deep(.password-field .v-field) {
    background-color: #CFE8B7 ;
}

:deep(.email-field .v-label),
:deep(.password-field .v-label) {
    color: #666666;
}

:deep(.email-field .v-field__input),
:deep(.password-field .v-field__input) {
    color: #666666 ;
}


.forgot-password {
    color: #666666;
    font-size: 0.9rem;
    margin-bottom: 20px;
    text-align: center;
}


.link-underline {
    color: #666666;
    text-decoration: underline;
}

.link-underline:hover {
    color: #333333;
}

.mb-4 {
    margin-bottom: 20px;
    width: 75%;
}

.login-btn {
    background-color: #8CC94F ;
    color: #666666 ;
    width: 200px;
    height: 40px;
    margin-bottom: 20px;
    text-transform: none;
}

:deep(.login-btn .v-btn__content) {
    color: #666666;
}

.register-text {
    color: #666666;
    font-size: 0.9rem;
    text-align: center;
}
</style>