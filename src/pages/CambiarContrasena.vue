<template>
    <BaseLayout>
        <div class="recovery-container">
            <h1 class="recovery-title">Cambiar contraseña</h1>
            
            <p class="recovery-subtitle">Por favor complete los siguientes datos:</p>
            
            <v-text-field
                v-model="currentPassword"
                label="Contraseña actual"
                :type="showCurrentPassword ? 'text' : 'password'"
                variant="outlined"
                class="email-field"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="toggleCurrentPasswordVisibility"
            ></v-text-field>
            
            <div class="password-row">
                <v-text-field
                    v-model="newPassword"
                    label="Nueva contraseña"
                    :type="showNewPassword ? 'text' : 'password'"
                    variant="outlined"
                    class="password-field"
                    :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="toggleNewPasswordVisibility"
                ></v-text-field>
                
                <v-text-field
                    v-model="repeatNewPassword"
                    label="Repetir nueva contraseña"
                    :type="showRepeatNewPassword ? 'text' : 'password'"
                    variant="outlined"
                    class="password-field"
                    :append-inner-icon="showRepeatNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="toggleRepeatNewPasswordVisibility"
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
                class="recovery-btn" 
                @click="handleChangePassword"
                :loading="isLoading"
                :disabled="isLoading"
            >
                Cambiar contraseña
            </v-btn>

            <div class="login-text">
                <router-link to="/" class="link-underline">Volver al inicio</router-link>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { changePassword } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const repeatNewPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showRepeatNewPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const toggleCurrentPasswordVisibility = () => {
    showCurrentPassword.value = !showCurrentPassword.value
}

const toggleNewPasswordVisibility = () => {
    showNewPassword.value = !showNewPassword.value
}

const toggleRepeatNewPasswordVisibility = () => {
    showRepeatNewPassword.value = !showRepeatNewPassword.value
}

const validateForm = () => {
    if (!currentPassword.value) {
        errorMessage.value = 'La contraseña actual es requerida'
        return false
    }

    if (!newPassword.value) {
        errorMessage.value = 'La nueva contraseña es requerida'
        return false
    }

    if (newPassword.value.length < 6) {
        errorMessage.value = 'La nueva contraseña debe tener al menos 6 caracteres'
        return false
    }

    if (newPassword.value !== repeatNewPassword.value) {
        errorMessage.value = 'Las nuevas contraseñas no coinciden'
        return false
    }

    if (currentPassword.value === newPassword.value) {
        errorMessage.value = 'La nueva contraseña debe ser diferente a la actual'
        return false
    }

    return true
}

const handleChangePassword = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!validateForm()) {
        return
    }

    // Verificar que el usuario esté autenticado
    if (!authStore.isAuthenticated) {
        errorMessage.value = 'Debe iniciar sesión para cambiar la contraseña'
        router.push('/login')
        return
    }

    isLoading.value = true

    try {
        await changePassword(currentPassword.value, newPassword.value)
        
        successMessage.value = 'Contraseña cambiada exitosamente'
        
        // Limpiar formulario
        currentPassword.value = ''
        newPassword.value = ''
        repeatNewPassword.value = ''
        
        // Redirigir después de un tiempo
        setTimeout(() => {
            router.push('/')
        }, 2000)
        
    } catch (error: any) {
        console.error('Error changing password:', error)
        
        if (error.status === 400) {
            errorMessage.value = 'Datos inválidos. Verifique que la contraseña actual sea correcta'
        } else if (error.status === 401) {
            errorMessage.value = 'No autorizado. Por favor inicie sesión nuevamente'
            authStore.clearAuth()
            router.push('/login')
        } else {
            errorMessage.value = error.message || 'Error al cambiar la contraseña. Intente nuevamente'
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
    margin-bottom: 20px !important;
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