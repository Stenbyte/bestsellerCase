<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ImagePicker from '@/components/ImagePicker.vue'
import TicketCreateFields from '@/components/TicketCreateFields.vue'
import { ApiError, type ZodFlatDetails } from '@/types/api'
import { useTickets } from '@/composables/useTickets'
import { useUiStore } from '@/stores/ui'
import type { Partner, SeedImage } from '@recolour/core'

const router = useRouter()
const ui = useUiStore()
const { createTicket, loadPartners, loadImages } = useTickets()

const fieldsRef = ref<InstanceType<typeof TicketCreateFields> | null>(null)
const partners = ref<Partner[]>([])
const images = ref<SeedImage[]>([])
const imagesOpen = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const imagePaths = ref<string[]>([])

onMounted(async () => {
  ;[partners.value, images.value] = await Promise.all([loadPartners(), loadImages()])
  await nextTick()
  if (partners.value[0]) fieldsRef.value?.setDefaultPartner(partners.value[0].id)
})

function applyValidationDetails(details: unknown) {
  const next: Record<string, string> = {}
  if (details && typeof details === 'object') {
    const flat = details as ZodFlatDetails
    for (const [key, messages] of Object.entries(flat.fieldErrors ?? {})) {
      if (messages?.[0]) next[key] = messages[0]
    }
    if (flat.formErrors?.[0]) formError.value = flat.formErrors[0]
  }
  fieldErrors.value = next
}

async function submit() {
  const values = fieldsRef.value?.getValues()
  if (!values) return

  submitting.value = true
  formError.value = null
  fieldErrors.value = {}
  try {
    const ticket = await createTicket({
      ...values,
      imagePaths: imagePaths.value,
    })
    ui.setBanner('Ticket created', 'success')
    await router.push({ name: 'ticket-detail', params: { id: ticket.id } })
  } catch (err) {
    if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
      formError.value = err.message
      applyValidationDetails(err.details)
    } else {
      formError.value = err instanceof Error ? err.message : 'Create failed'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="page">
    <header class="page__head">
      <h1>Create ticket</h1>
      <p class="lede">Pick seed images from the allowlist. Paths are validated on the server.</p>
    </header>

    <form class="form" @submit.prevent="submit">
      <TicketCreateFields
        ref="fieldsRef"
        :partners="partners"
        :field-errors="fieldErrors"
      />

      <fieldset>
        <legend>Images</legend>
        <p v-if="fieldErrors.imagePaths" class="field-error">{{ fieldErrors.imagePaths }}</p>
        <p class="hint">
          {{ imagePaths.length }} selected
          <button type="button" class="linkish" @click="imagesOpen = !imagesOpen">
            {{ imagesOpen ? 'Hide list' : 'Choose images' }}
          </button>
        </p>
        <ImagePicker v-if="imagesOpen" v-model="imagePaths" :images="images" />
      </fieldset>

      <p v-if="formError" class="field-error">{{ formError }}</p>

      <div class="actions">
        <button class="btn btn--primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Creating…' : 'Create ticket' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.page__head {
  margin-bottom: 1.25rem;
}

h1 {
  margin: 0 0 0.25rem;
}

.lede {
  margin: 0;
  color: var(--muted);
}

.form {
  display: grid;
  gap: 1rem;
  max-width: 48rem;
}

fieldset {
  display: grid;
  gap: 0.5rem;
  border: 1px solid var(--line);
  padding: 0.85rem;
  background: var(--surface);
  font-size: 0.9rem;
  font-weight: 600;
}

legend {
  padding: 0 0.35rem;
}

.hint {
  margin: 0;
  font-weight: 400;
  color: var(--muted);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.linkish {
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
}
</style>
