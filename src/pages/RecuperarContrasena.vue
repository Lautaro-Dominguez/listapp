<template>
    <BaseLayout>
        <div class="recovery-container">
            <h1 class="recovery-title">Recuperar contraseña</h1>
            
            <p class="recovery-subtitle">Por favor ingrese su correo electrónico:</p>
            
            <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                class="email-field"
            ></v-text-field>
            
            <v-alert
                v-if="errorMessage"
                type="error"
                class="mb-4"
            >
                {{ errorMessage }}
            </v-alert>
            
            <v-alert
                v-if="successMessage"
                type="success"
                class="mb-4"
            >
                {{ successMessage }}
            </v-alert>
            
            <v-btn 
                class="recovery-btn" 
                @click="handleForgotPassword"
                :loading="isLoading"
                :disabled="isLoading"
            >
                Enviar código
            </v-btn>

            <div class="login-text">
                ¿Recordó su contraseña? Inicie sesión 
                <router-link to="/login" class="link-underline">aquí</router-link>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { forgotPassword } from '@/utils/api'

const router = useRouter()

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleForgotPassword = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!email.value.trim()) {
        errorMessage.value = 'El correo electrónico es requerido'
        return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
        errorMessage.value = 'Por favor ingrese un correo electrónico válido'
        return
    }

    isLoading.value = true

    try {
        await forgotPassword(email.value.trim())
        
        successMessage.value = 'Se ha enviado un código de recuperación a su correo electrónico'
        
        sessionStorage.setItem('recovery-email', email.value.trim())
        
        setTimeout(() => {
            router.push('/reset-password')
        }, 2000)
        
    } catch (error: any) {
        console.error('Error sending recovery email:', error)
        
        if (error.status === 400) {
            errorMessage.value = 'Datos inválidos. Verifique el correo electrónico ingresado'
        } else if (error.status === 404) {
            errorMessage.value = 'No se encontró una cuenta con este correo electrónico'
        } else {
            errorMessage.value = error.message || 'Error al enviar el código de recuperación. Intente nuevamente'
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.recovery-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.recovery-title {
    color: black;
    font-size: 2.5rem;
    font-weight: normal;
    margin-top: 15px;
    margin-bottom: 32px;
    text-align: center;
}

.recovery-subtitle {
    color: #666666;
    font-size: 1rem;
    margin-bottom: 20px;
    text-align: left;
    width: 75%;
}

.email-field {
    width: 75%;
}

.password-row {
    display: flex;
    gap: 20px;
    width: 75%;
}

.password-field {
    flex: 1;
}


:deep(.email-field .v-field),
:deep(.password-field .v-field) {
    background-color: #CFE8B7;
}

:deep(.email-field .v-label),
:deep(.password-field .v-label) {
    color: #666666;
}

:deep(.email-field .v-field__input),
:deep(.password-field .v-field__input) {
    color: #666666;
}

.mb-4 {
    margin-bottom: 20px;
    width: 75%;
}

.recovery-btn {
    background-color: #8CC94F;
    color: #666666;
    width: 200px;
    height: 40px;
    text-transform: none;
    margin-bottom: 20px;
}

:deep(.recovery-btn .v-btn__content) {
    color: #666666;
}


.login-text {
    color: #666666;
    font-size: 0.9rem;
    text-align: center;
}

.link-underline {
    color: #666666;
    text-decoration: underline;
}

.link-underline:hover {
    color: #333333;
}
</style>