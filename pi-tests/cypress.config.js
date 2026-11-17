const { defineConfig } = require('cypress')

const defaultApiBaseUrl = 'https://api.corevent.site'

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.API_BASE_URL || defaultApiBaseUrl,
    supportFile: false,
    video: false,
    setupNodeEvents(on, config) {
      config.env.API_BASE_URL = process.env.API_BASE_URL || defaultApiBaseUrl
      return config
    },
  },
})
