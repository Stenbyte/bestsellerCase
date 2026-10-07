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
const { createTicket, loadPartners, loadImages, uploadImage } = useTickets()

const fieldsRef = ref<InstanceType<typeof TicketCreateFields> | null>(null)
const partners = ref<Partner[]>([])
const images = ref<SeedImage[]>([])
const imagesOpen = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const imagePaths = ref<string[]>([])
const uploadedExtras = ref<SeedImage[]>([])

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

async function onUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploading.value = true
  formError.value = null
  try {
    const image = await uploadImage(file)
    uploadedExtras.value = [...uploadedExtras.value, image]
    if (!imagePaths.value.includes(image.path)) {
      imagePaths.value = [...imagePaths.value, image.path]
    }
    imagesOpen.value = true
    ui.setBanner('Image uploaded', 'success')
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    uploading.value = false
  }
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
      <p class="lede">
        Pick seed images or upload a JPEG. Paths are allowlisted / validated on the server.
      </p>
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
            {{ imagesOpen ? 'Hide list' : 'Choose seed images' }}
          </button>
          <label class="linkish upload-label">
            {{ uploading ? 'Uploading…' : 'Upload JPEG' }}
            <input
              type="file"
              accept="image/jpeg,.jpg,.jpeg"
              :disabled="uploading"
              @change="onUpload"
            />
          </label>
        </p>
        <ul v-if="uploadedExtras.length" class="uploaded">
          <li v-for="img in uploadedExtras" :key="img.path">{{ img.path }}</li>
        </ul>
        <ImagePicker
          v-if="imagesOpen"
          v-model="imagePaths"
          :images="[...images, ...uploadedExtras]"
        />
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

.upload-label {
  display: inline-flex;
  cursor: pointer;
}

.upload-label input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}

.uploaded {
  margin: 0;
  padding-left: 1.1rem;
  font-weight: 400;
  font-size: 0.8rem;
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 0.75rem;
}
</style>
