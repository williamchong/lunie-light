<template>
  <div class="session-container">
    <h2 class="session-title">AuthCore</h2>

    <div v-if="!accounts.length && !isSigningIn" class="session-main">
      <div id="authcore-register-container" />
    </div>

    <div v-if="error" class="error-container">
      <p>There was an error connecting to the Authcore:<br /></p>
      <p class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { AuthCoreWidgets } from 'authcore-js'
import network from '~/common/network'

export default {
  name: `SessionAuthCore`,
  layout: 'session',
  data() {
    return {
      widget: undefined,
    }
  },
  computed: {
    ...mapState('authcore', [`accounts`, `initialized`, `error`, `loading`]),
    isSigningIn() {
      const { code } = this.$route.query
      return !!code
    },
  },
  watch: {
    accounts: {
      immediate: false,
      handler(accounts) {
        if (accounts && accounts.length === 1) {
          this.signInAndRedirect(accounts[0])
        }
      },
    },
  },
  async mounted() {
    if (!this.isSigningIn) {
      this.initWidget()
    } else {
      const { code, ...query } = this.$route.query
      try {
        await this.$store.dispatch('authcore/init', code)
      } catch (err) {
        console.error(err)
        this.$router.replace({ ...this.$route, query })
        this.initWidget()
      }
    }
  },
  methods: {
    initWidget() {
      this.widget = new AuthCoreWidgets.Login({
        primaryColour: '#28646e',
        container: 'authcore-register-container',
        root: `${network.authcoreURL}/widgets`,
        initialScreen: 'signin',
        successRedirectUrl: `${network.siteURL}/authcore`,
        socialLoginPaneStyle: 'top',
        socialLoginPaneOption: 'grid',
        internal: true,
      })
    },
    signIn(account) {
      this.$store.dispatch(`signIn`, {
        sessionType: `authcore`,
        address: account,
      })
    },
    async signInAndRedirect(account) {
      await this.signIn(account)
      this.$router.push('/')
    },
  },
}
</script>
<style scoped>
.session-main {
  display: flex;
  justify-content: center;
}

#authcore-register-container {
  flex: 1;
}

.accounts {
  flex-direction: column;
}

.extension-message {
  text-align: center;
}
</style>
