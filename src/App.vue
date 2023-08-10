<script setup>
import { ref } from "vue"

const links = ref([
  { path: "login", name: "Login" },
  { path: "signup", name: "Signup" },
])

</script>

<template>
  <header class="header">
    <h1>Spore</h1>
    <nav>
      <ul class="header__list">
        <li v-for="link in links" :key="link.path">
          <router-link :to="link.path">{{ link.name }}</router-link>
        </li>
      </ul>
    </nav>
  </header>

  <router-view></router-view>
</template>

<style scoped>
.header {
  background-color: rgb(232, 232, 232);
  padding-inline: 0.8rem;
  padding-block: 0.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__list {
  display: flex;
  list-style: none;
  gap: 1rem;
}
</style>
