<template>
  <div>
      <div id="navbar-logo" class="text-center">
        <img alt="vuetron-logo" class="text-center" src="http://i1153.photobucket.com/albums/p520/samanthasalley/vuetron/vuetron-logo-light_zpsmxlwlf9m.png~original" />
      </div>
      <b-list-group id="navbar-links" class="text-center">
        <b-list-group-item v-for="(routeObj, index) in routes" :key="index" class="router-item">
          <router-link :to="routeObj.path" class="route-link" :class="[ currentRoute.path === routeObj.path ? 'active' : '' ]">
            {{ routeObj.name }}
          </router-link>
          <hr>
        </b-list-group-item>
      </b-list-group>
  </div>
</template>


<script>
export default {
  data() {
    return {
      routes: [
        { path: "/", name: 'Home' },
        { path: "/eventstream", name: 'Event Stream' },
        { path: "/subscription", name: 'Subscriptions' },
        { path: "/state", name: 'State' },
        { path: "/componentTree", name: 'Vue Vision' }
      ]
    };
  },
  computed: {
    currentRoute () {
      return this.$route;
    }
  }
};
</script>

<style>
</style>

<style scoped>
  a {
    text-decoration: none;
    color: #31B689;
  }
  a.active {
    color: #EDDBB4;
  }

  .list-group {
    width: 100%;
    margin-top: 20px;
  }
  .list-group-item {
    background: transparent;
    border: none;
  }

  .route-link {
    font-size: 1.3rem;
  }

  #navbar-logo {
    margin-left: auto;
    margin-right: auto;
  }
</style>        
