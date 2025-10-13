<template>
    <BaseLayout>
        <div class="register-container">
            <h1 class="register-title">Registro</h1>
            
            <p class="register-subtitle">Por favor complete los siguientes datos:</p>
            
            <div class="name-row">
                <v-text-field
                    v-model="nombre"
                    label="Nombre"
                    variant="outlined"
                    class="name-field"
                ></v-text-field>
                
                <v-text-field
                    v-model="apellido"
                    label="Apellido"
                    variant="outlined"
                    class="name-field"
                ></v-text-field>
            </div>
            
            <v-text-field
                v-model="apodo"
                label="Apodo"
                variant="outlined"
                class="email-field"
            ></v-text-field>
            
            <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                class="email-field"
            ></v-text-field>
            
            <div class="password-row">
                <v-text-field
                    v-model="password"
                    label="Contraseña"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    class="password-field"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="togglePasswordVisibility"
                ></v-text-field>
                
                <v-text-field
                    v-model="repeatPassword"
                    label="Repetir contraseña"
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
                class="register-btn" 
                @click="handleRegister"
                :loading="isLoading"
                :disabled="isLoading"
            >
                Enviar
            </v-btn>
            
            <div class="login-text">
                ¿Ya tiene cuenta? Inicie sesión 
                <router-link to="/login" class="link-underline">aquí</router-link>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { buildApiUrl, API_ENDPOINTS } from '@/utils/api'

const router = useRouter()

const nombre = ref('')
const apellido = ref('')
const apodo = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const showPassword = ref(false)
const showRepeatPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const toggleRepeatPasswordVisibility = () => {
    showRepeatPassword.value = !showRepeatPassword.value
}

const handleRegister = async () => {
    if (!nombre.value || !apellido.value || !email.value || !password.value || !repeatPassword.value) {
        errorMessage.value = 'Todos los campos son obligatorios'
        return
    }

    if (password.value !== repeatPassword.value) {
        errorMessage.value = 'Las contraseñas no coinciden'
        return
    }

    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.REGISTER), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: nombre.value,
                surname: apellido.value,
                email: email.value,
                password: password.value,
                metadata: {
                    apodo: apodo.value
                }
            })
        })

        if (response.status === 201) {
            const data = await response.json()
            successMessage.value = 'Usuario registrado exitosamente. Redirigiendo a verificación...'
            
            sessionStorage.setItem('registration-email', email.value)
            
            nombre.value = ''
            apellido.value = ''
            apodo.value = ''
            const emailToSave = email.value 
            email.value = ''
            password.value = ''
            repeatPassword.value = ''
            
            setTimeout(() => {
                router.push('/verificacion')
            }, 2000)
            
        } else if (response.status === 400) {
            errorMessage.value = 'Datos inválidos. Por favor revise la información ingresada.'
        } else if (response.status === 500) {
            errorMessage.value = 'Error interno del servidor. Intente nuevamente más tarde.'
        } else {
            errorMessage.value = 'Error inesperado. Intente nuevamente.'
        }
        
    } catch (error) {
        console.error('Error en registro:', error)
        errorMessage.value = 'Error de conexión. Verifique su conexión a internet.'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.register-title {
    color: black;
    font-size: 2.5rem;
    font-weight: normal;
    margin-top: 15px;
    margin-bottom: 15px;
    text-align: center;
}


.register-subtitle {
    color: #666666;
    font-size: 1rem;
    margin-bottom: 20px;
    text-align: left;
    width: 75%;
}

.name-row {
    display: flex;
    gap: 20px;
    width: 75%;
}

.name-field {
    flex: 1;
}

.email-field {
    width: 75%;
}

.password-row {
    display: flex;
    gap: 20px;
    width: 75%;
    margin-bottom: 20px;
}

.password-field {
    flex: 1;
}

:deep(.name-field .v-field),
:deep(.email-field .v-field),
:deep(.password-field .v-field) {
    background-color: #CFE8B7;
}

:deep(.name-field .v-label),
:deep(.email-field .v-label),
:deep(.password-field .v-label) {
    color: #666666;
}

:deep(.name-field .v-field__input),
:deep(.email-field .v-field__input),
:deep(.password-field .v-field__input) {
    color: #666666;
}

.mb-4 {
    margin-bottom: 20px ;
    width: 75%;
}

.register-btn {
    background-color: #8CC94F;
    color: #666666;
    width: 200px;
    height: 40px;
    text-transform: none;
    margin-bottom: 16px;
}

:deep(.register-btn .v-btn__content) {
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