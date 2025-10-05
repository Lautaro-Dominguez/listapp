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
            
            <v-btn class="register-btn" @click="handleRegister">
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
import BaseLayout from '@/layouts/BaseLayout.vue'

const nombre = ref('')
const apellido = ref('')
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

const handleRegister = () => {
    // Sin funcionalidad por ahora
    console.log('Registro:', { nombre: nombre.value, apellido: apellido.value, email: email.value })
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