<template>
  <router-link :to="to" class="direct-access-link">
    <div class="direct-access-box">
      <div class="image-container" v-if="image">
        <img :src="image" :alt="text" class="access-image" />
      </div>
      <div class="text-container">
        <p class="access-text">{{ text }}</p>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  to: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.direct-access-link {
  text-decoration: none;
  color: inherit;
  width: 20%;
}

.direct-access-box {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
  height: 200px;
}

.direct-access-box:hover {
  transform: translateY(-2px);
}

.image-container {
  margin-bottom: 10px;
}

.access-image {
  width: 60%;
  object-fit: contain;
}

.text-container {
  margin: 0;
}

.access-text {
  margin: 0;
  font-size: 1.5rem;
  color: #222;
  font-weight: 500;
}
</style>
