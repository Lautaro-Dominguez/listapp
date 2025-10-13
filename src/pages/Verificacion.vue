<template>
    <BaseLayout>
        <div class="verification-container">
            <h1 class="verification-title">Verificación</h1>
            
            <p class="verification-subtitle">Por favor ingrese el código que recibió por correo electrónico:</p>
            
            <v-text-field
                v-model="verificationCode"
                label="Código de verificación"
                variant="outlined"
                class="code-field"
            ></v-text-field>
            
            <div class="resend-code">
                <span @click="handleResendCode" class="link-underline resend-link" :class="{ disabled: isResending }">
                    {{ isResending ? 'Reenviando...' : 'Reenviar código' }}
                </span>
            </div>
            
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
                class="verification-btn" 
                @click="handleVerification"
                :loading="isLoading"
                :disabled="isLoading"
            >
                Verificar
            </v-btn>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { buildApiUrl, API_ENDPOINTS, sendVerificationCode } from '@/utils/api'

const router = useRouter()
const email = ref('')
const verificationCode = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleResendCode = async () => {
    if (!email.value) {
        errorMessage.value = 'No se pudo obtener el email para reenviar el código'
        return
    }

    errorMessage.value = ''
    successMessage.value = ''
    isResending.value = true

    try {
        await sendVerificationCode(email.value)
        successMessage.value = 'Nuevo código enviado a su correo electrónico'
    } catch (error: any) {
        console.error('Error resending code:', error)
        
        if (error.status === 400) {
            errorMessage.value = 'Error al enviar el código. Verifique el correo electrónico'
        } else if (error.status === 404) {
            errorMessage.value = 'No se encontró una cuenta con este correo electrónico'
        } else if (error.status === 409) {
            errorMessage.value = 'Ya se envió un código recientemente. Espere antes de solicitar otro'
        } else {
            errorMessage.value = error.message || 'Error al reenviar el código. Intente nuevamente'
        }
    } finally {
        isResending.value = false
    }
}

const handleVerification = async () => {
    if (!verificationCode.value.trim()) {
        errorMessage.value = 'Por favor ingrese el código de verificación'
        return
    }

    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.VERIFY_ACCOUNT), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: verificationCode.value.trim()
            })
        })

        if (response.status === 200) {
            successMessage.value = 'Cuenta verificada exitosamente. Redirigiendo al login...'
            verificationCode.value = ''
            
            sessionStorage.removeItem('registration-email')
            sessionStorage.removeItem('recovery-email')
            
            setTimeout(() => {
                router.push('/login')
            }, 2000)
            
        } else if (response.status === 400) {
            errorMessage.value = 'Código inválido. Por favor verifique e intente nuevamente.'
        } else if (response.status === 409) {
            errorMessage.value = 'La cuenta ya está verificada o existe un conflicto.'
        } else if (response.status === 500) {
            errorMessage.value = 'Error interno del servidor. Intente nuevamente más tarde.'
        } else {
            errorMessage.value = 'Error inesperado. Intente nuevamente.'
        }
        
    } catch (error) {
        console.error('Error en verificación:', error)
        errorMessage.value = 'Error de conexión. Verifique su conexión a internet.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    const storedEmail = sessionStorage.getItem('registration-email') || sessionStorage.getItem('recovery-email')
    if (storedEmail) {
        email.value = storedEmail
    }
})
</script>

<style scoped>
.verification-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}


.verification-title {
    color: black;
    font-size: 2.5rem;
    font-weight: normal;
    margin-top: 15px;
    margin-bottom: 32px;
    text-align: center;
}


.verification-subtitle {
    color: #666666;
    font-size: 1rem;
    margin-bottom: 20px;
    text-align: left;
    width: 75%;
}


.code-field {
    width: 75%;
    margin-bottom: 20px;
}


:deep(.code-field .v-field) {
    background-color: #CFE8B7;
}

:deep(.code-field .v-label) {
    color: #666666;
}

:deep(.code-field .v-field__input) {
    color: #666666;
}

.resend-code {
    color: #666666;
    font-size: 0.9rem;
    margin-bottom: 20px;
    text-align: center;
}

.link-underline {
    color: #666666;
    text-decoration: underline;
    cursor: pointer;
}

.link-underline:hover {
    color: #333333;
}

.resend-link {
    cursor: pointer;
}

.resend-link.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.resend-link.disabled:hover {
    color: #666666;
}


.mb-4 {
    margin-bottom: 20px ;
    width: 75%;
}

.verification-btn {
    background-color: #8CC94F;
    color: #666666;
    width: 200px;
    height: 40px;
    text-transform: none;
    margin-bottom: 20px;
}

:deep(.verification-btn .v-btn__content) {
    color: #666666;
}
</style>