<script setup lang="ts">
import { ref } from 'vue'
import { PRIORITIES, type Partner, type Priority } from '@recolour/core'

defineProps<{
  partners: Partner[]
  fieldErrors: Record<string, string>
}>()

const photoId = ref('')
const style = ref('')
const priority = ref<Priority>('medium')
const partnerId = ref('')
const pantoneNotes = ref('')

function setDefaultPartner(id: string) {
  if (!partnerId.value) partnerId.value = id
}

defineExpose({
  setDefaultPartner,
  getValues: () => ({
    photoId: photoId.value,
    style: style.value,
    priority: priority.value,
    partnerId: partnerId.value,
    pantoneNotes: pantoneNotes.value,
  }),
})
</script>

<template>
  <div class="fields">
    <div class="field">
      <label for="photoId">Photo ID</label>
      <input id="photoId" v-model="photoId" type="text" required maxlength="64" autocomplete="off" />
      <span v-if="fieldErrors.photoId" class="field-error">{{ fieldErrors.photoId }}</span>
    </div>

    <div class="field">
      <label for="style">Style</label>
      <input id="style" v-model="style" type="text" required maxlength="200" autocomplete="off" />
      <span v-if="fieldErrors.style" class="field-error">{{ fieldErrors.style }}</span>
    </div>

    <div class="row">
      <div class="field">
        <label for="priority">Priority</label>
        <select id="priority" v-model="priority">
          <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="field">
        <label for="partnerId">Partner</label>
        <select id="partnerId" v-model="partnerId" required>
          <option v-for="p in partners" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <span v-if="fieldErrors.partnerId" class="field-error">{{ fieldErrors.partnerId }}</span>
      </div>
    </div>

    <div class="field">
      <label for="pantoneNotes">Pantone notes</label>
      <textarea
        id="pantoneNotes"
        v-model="pantoneNotes"
        rows="4"
        required
        maxlength="2000"
        autocomplete="off"
        spellcheck="false"
      />
      <span v-if="fieldErrors.pantoneNotes" class="field-error">{{ fieldErrors.pantoneNotes }}</span>
    </div>
  </div>
</template>

<style scoped>
.fields {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field > label {
  font-size: 0.9rem;
  font-weight: 600;
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

textarea {
  resize: vertical;
  min-height: 6rem;
  line-height: 1.4;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
