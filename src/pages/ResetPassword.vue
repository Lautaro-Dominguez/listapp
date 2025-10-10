<template>
    <BaseLayout>
        <div class="reset-container">
            <h1 class="reset-title">Restablecer contraseña</h1>
            
            <p class="reset-subtitle">Ingrese el código enviado a {{ email }} y su nueva contraseña:</p>
            
            <v-text-field
                v-model="code"
                label="Código de verificación"
                variant="outlined"
                class="email-field"
                maxlength="16"
            ></v-text-field>
            
            <div class="password-row">
                <v-text-field
                    v-model="password"
                    label="Nueva contraseña"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    class="password-field"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="togglePasswordVisibility"
                ></v-text-field>
                
                <v-text-field
                    v-model="repeatPassword"
                    label="Repetir nueva contraseña"
                    :type="showRepeatPassword ? 'text' : 'password'"
                    variant="outlined"
                    class="password-field"
                    :append-inner-icon="showRepeatPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="toggleRepeatPasswordVisibility"
                ></v-text-field>
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
                class="reset-btn" 
                @click="handleResetPassword"
                :loading="isLoading"
                :disabled="isLoading"
            >
                Restablecer contraseña
            </v-btn>

            <div class="login-text">
                ¿No recibió el código? 
                <span @click="handleResendCode" class="link-underline resend-link" :class="{ disabled: isResending }">
                    {{ isResending ? 'Reenviando...' : 'Reenviar código' }}
                </span>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { resetPassword, sendVerificationCode } from '@/utils/api'

const router = useRouter()
const route = useRoute()

const email = ref('')
const code = ref('')
const password = ref('')
const repeatPassword = ref('')
const showPassword = ref(false)
const showRepeatPassword = ref(false)
const isLoading = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const toggleRepeatPasswordVisibility = () => {
    showRepeatPassword.value = !showRepeatPassword.value
}

const validateForm = () => {
    if (!code.value.trim()) {
        errorMessage.value = 'El código de verificación es requerido'
        return false
    }

    if (!password.value) {
        errorMessage.value = 'La nueva contraseña es requerida'
        return false
    }

    if (password.value.length < 6) {
        errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
        return false
    }

    if (password.value !== repeatPassword.value) {
        errorMessage.value = 'Las contraseñas no coinciden'
        return false
    }

    return true
}

const handleResetPassword = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!validateForm()) {
        return
    }

    isLoading.value = true

    try {
        await resetPassword(code.value, password.value)
        
        successMessage.value = 'Contraseña restablecida exitosamente. Redirigiendo a iniciar sesión...'
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('recovery-email')
        
        // Limpiar formulario
        code.value = ''
        password.value = ''
        repeatPassword.value = ''
        
        // Redirigir a login después de un tiempo
        setTimeout(() => {
            router.push('/login')
        }, 2000)
        
    } catch (error: any) {
        console.error('Error resetting password:', error)
        
        if (error.status === 400) {
            errorMessage.value = 'Código inválido o expirado. Verifique el código ingresado'
        } else if (error.status === 404) {
            errorMessage.value = 'Código no encontrado. Solicite un nuevo código de recuperación'
        } else {
            errorMessage.value = error.message || 'Error al restablecer la contraseña. Intente nuevamente'
        }
    } finally {
        isLoading.value = false
    }
}

const handleResendCode = async () => {
    if (!email.value) {
        errorMessage.value = 'No se pudo obtener el email. Vuelva a solicitar el código desde recuperar contraseña'
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

onMounted(() => {
    // Obtener email del sessionStorage
    const storedEmail = sessionStorage.getItem('recovery-email')
    if (storedEmail) {
        email.value = storedEmail
    } else {
        // Si no hay email en sessionStorage, redirigir a recuperar contraseña
        router.push('/recuperar-contraseña')
    }
})
</script>

<style scoped>
.reset-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.reset-title {
    color: black;
    font-size: 2.5rem;
    font-weight: normal;
    margin-top: 15px;
    margin-bottom: 32px;
    text-align: center;
}

.reset-subtitle {
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
    margin-bottom: 20px !important;
    width: 75%;
}

.reset-btn {
    background-color: #8CC94F;
    color: #666666;
    width: 200px;
    height: 40px;
    text-transform: none;
    margin-bottom: 20px;
}

:deep(.reset-btn .v-btn__content) {
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
</style>