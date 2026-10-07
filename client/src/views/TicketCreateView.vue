<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError, type ZodFlatDetails } from '@/types/api'
import { useTickets } from '@/composables/useTickets'
import { useUiStore } from '@/stores/ui'
import { PRIORITIES, type Partner, type Priority, type SeedImage } from '@recolour/core'

const router = useRouter()
const ui = useUiStore()
const { createTicket, loadPartners, loadImages } = useTickets()

const partners = ref<Partner[]>([])
const images = ref<SeedImage[]>([])
const submitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const form = reactive({
  photoId: '',
  style: '',
  priority: 'medium' as Priority,
  partnerId: '',
  pantoneNotes: '',
  imagePaths: [] as string[],
})

onMounted(async () => {
  ;[partners.value, images.value] = await Promise.all([loadPartners(), loadImages()])
  if (partners.value[0]) form.partnerId = partners.value[0].id
})

function toggleImage(path: string) {
  const i = form.imagePaths.indexOf(path)
  if (i === -1) form.imagePaths.push(path)
  else form.imagePaths.splice(i, 1)
}

function applyValidationDetails(details: unknown) {
  fieldErrors.value = {}
  if (!details || typeof details !== 'object') return
  const flat = details as ZodFlatDetails
  for (const [key, messages] of Object.entries(flat.fieldErrors ?? {})) {
    if (messages?.[0]) fieldErrors.value[key] = messages[0]
  }
  if (flat.formErrors?.[0]) formError.value = flat.formErrors[0]
}

async function submit() {
  submitting.value = true
  formError.value = null
  fieldErrors.value = {}
  try {
    const ticket = await createTicket({ ...form })
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
      <label>
        Photo ID
        <input v-model="form.photoId" type="text" required maxlength="64" />
        <span v-if="fieldErrors.photoId" class="field-error">{{ fieldErrors.photoId }}</span>
      </label>

      <label>
        Style
        <input v-model="form.style" type="text" required maxlength="200" />
        <span v-if="fieldErrors.style" class="field-error">{{ fieldErrors.style }}</span>
      </label>

      <div class="row">
        <label>
          Priority
          <select v-model="form.priority">
            <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
        <label>
          Partner
          <select v-model="form.partnerId" required>
            <option v-for="p in partners" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <span v-if="fieldErrors.partnerId" class="field-error">{{ fieldErrors.partnerId }}</span>
        </label>
      </div>

      <label>
        Pantone notes
        <textarea v-model="form.pantoneNotes" rows="4" required maxlength="2000" />
        <span v-if="fieldErrors.pantoneNotes" class="field-error">{{ fieldErrors.pantoneNotes }}</span>
      </label>

      <fieldset>
        <legend>Images</legend>
        <p v-if="fieldErrors.imagePaths" class="field-error">{{ fieldErrors.imagePaths }}</p>
        <div class="images">
          <label v-for="img in images" :key="img.path" class="image-pick">
            <input
              type="checkbox"
              :checked="form.imagePaths.includes(img.path)"
              @change="toggleImage(img.path)"
            />
            <img :src="img.url" :alt="img.path" loading="lazy" />
            <span>{{ img.path }}</span>
          </label>
        </div>
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

label,
fieldset {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
}

fieldset {
  border: 1px solid var(--line);
  padding: 0.85rem;
  background: var(--surface);
}

legend {
  padding: 0 0.35rem;
}

input,
select,
textarea {
  font: inherit;
  font-weight: 400;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fff;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.65rem;
  font-weight: 400;
}

.image-pick {
  border: 1px solid var(--line);
  padding: 0.4rem;
  background: #fff;
  cursor: pointer;
}

.image-pick img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.image-pick span {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.68rem;
  color: var(--muted);
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
