<template>
  <BaseLayout>
    <div class = "background">
        <h1 class="title">Bienvenido a ListAPP</h1>
        <h2 class="subtitle">El mejor lugar para organizar tus listas de compras</h2>
    </div>
    <div class="direct-access-container" >
        <DirectAccess text="Listas" :image="listsImg" to="/listas" />
        <DirectAccess text="Productos" :image="appleImg" to="/productos" />
        <DirectAccess text="Despensa" :image="pantryImg" to="/despensa" />
    </div>
    </BaseLayout>
</template>

<script setup>
import BaseLayout from '@/layouts/BaseLayout.vue'
import DirectAccess from '@/components/DirectAccess.vue'
import listsImg from '@/assets/lists.png'
import appleImg from '@/assets/apple.png'
import pantryImg from '@/assets/pantry.png'
</script>

<style scoped>


.background {
  background-image: url('@/assets/background_home.png');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: normal;
  margin-bottom: 50px;
  color: white;
  text-align: center;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: normal;
  margin: 0;
  color: white;
  text-align: center;
}

.direct-access-container {
  display: flex;
  justify-content: space-around;
  margin: 40px ;
}
</style>