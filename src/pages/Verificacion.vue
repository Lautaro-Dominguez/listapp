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
                <router-link to="#" class="link-underline" @click.prevent="resendCode">Reenviar código</router-link>
            </div>
            
            <v-btn class="verification-btn" @click="handleVerification">
                Verificar
            </v-btn>
        </div>
    </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseLayout from '@/layouts/BaseLayout.vue'

const verificationCode = ref('')

const resendCode = () => {
    // Sin funcionalidad por ahora
    console.log('Reenviar código solicitado')
}

const handleVerification = () => {
    // Sin funcionalidad por ahora
    console.log('Verificación:', { code: verificationCode.value })
}
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