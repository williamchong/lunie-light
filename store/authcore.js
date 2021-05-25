import { AuthCoreAuthClient } from 'authcore-js'
import { AuthcoreVaultClient, AuthcoreCosmosProvider } from 'secretd-js'
import network from '~/common/network'

export const state = () => ({
  authClient: null,
  kvClient: null,
  cosmosProvider: null,
  accounts: [],
  error: undefined,
  loading: false,
})

export const mutations = {
  // create set methods from data points
  ...Object.fromEntries(
    Object.keys(state()).map((entity) => {
      return [
        `set${entity.charAt(0).toUpperCase()}${entity.substr(1)}`,
        (state, value) => {
          state[entity] = value
        },
      ]
    })
  ),
}

export const actions = {
  async init({ commit }, code) {
    commit('setError', undefined)
    commit('setLoading', true)
    try {
      const authClient = await new AuthCoreAuthClient({
        apiBaseURL: network.authcoreURL,
      })
      commit('setAuthClient', authClient)
      const token = await authClient.createAccessToken(code)
      const { access_token: accessToken } = token
      await authClient.setAccessToken(accessToken)
      const kvClient = await new AuthcoreVaultClient({
        apiBaseURL: network.authcoreURL,
        accessToken,
      })
      commit('setKvClient', kvClient)
      const cosmosProvider = await new AuthcoreCosmosProvider({
        client: kvClient,
      })
      commit('setCosmosProvider', cosmosProvider)
      const accounts = await cosmosProvider.getAddresses()
      commit('setAccounts', accounts)
    } catch (err) {
      commit('setLoading', false)
      commit('setError', err.message)
    }
    commit('setLoading', false)
  },
}
