<template>
    <BaseLayout>
        <div class="recovery-container">
            <h1 class="recovery-title">Recuperar contraseña</h1>
            
            <p class="recovery-subtitle">Por favor complete los siguientes datos:</p>
            
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
            
            <v-btn class="recovery-btn" @click="handleRecovery">
                Enviar
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
import BaseLayout from '@/layouts/BaseLayout.vue'

const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const showPassword = ref(false)
const showRepeatPassword = ref(false)

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const toggleRepeatPasswordVisibility = () => {
    showRepeatPassword.value = !showRepeatPassword.value
}

const handleRecovery = () => {
    // Sin funcionalidad por ahora
    console.log('Recuperar contraseña:', { email: email.value, password: password.value })
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