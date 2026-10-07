import { defineStore } from 'pinia'
import { ref } from 'vue'

export type BannerTone = 'info' | 'error' | 'success'

export const useUiStore = defineStore('ui', () => {
  const banner = ref<string | null>(null)
  const tone = ref<BannerTone>('info')

  function setBanner(message: string, nextTone: BannerTone = 'info') {
    banner.value = message
    tone.value = nextTone
  }

  function clearBanner() {
    banner.value = null
  }

  return { banner, tone, setBanner, clearBanner }
})
