<script setup>
import { MATCH_SETTING_DEFINITIONS } from '../../config/matchSettings.js'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  classificationLabel: {
    type: String,
    required: true
  },
  locked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update-setting', 'reset'])

function update(settingId, event) {
  if (props.locked) return
  emit('update-setting', settingId, event.target.checked)
}
</script>

<template>
  <!-- Match Settings | Offers four compact pre-match preferences -->
  <fieldset class="match-settings" :class="{ 'match-settings--locked': locked }">
    <legend class="sr-only">Match settings</legend>
    <div class="settings-heading">
      <span class="settings-title">Match settings</span>
      <span class="classification-badge">{{ classificationLabel }}</span>
      <button v-if="!locked" type="button" class="reset-button" @click="emit('reset')">
        Reset
      </button>
    </div>

    <div class="settings-grid">
      <label
        v-for="setting in MATCH_SETTING_DEFINITIONS"
        :key="setting.id"
        class="setting-toggle"
        :class="{ 'setting-toggle--active': settings[setting.id] }"
      >
        <input
          type="checkbox"
          :checked="settings[setting.id]"
          :disabled="locked"
          @change="update(setting.id, $event)"
        />
        <span class="toggle-light" aria-hidden="true"></span>
        <span class="setting-copy">
          <strong>{{ setting.name }}</strong>
          <small>{{ setting.description }}</small>
        </span>
      </label>
    </div>

    <p v-if="locked" class="settings-note">
      Guided Practice uses fixed teaching settings and does not affect records.
    </p>
  </fieldset>
</template>

<style scoped>
.match-settings {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.settings-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.42rem;
}

.settings-title {
  padding: 0;
  color: var(--color-text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.classification-badge {
  padding: 0.16rem 0.38rem;
  border: 1px solid rgba(208, 174, 103, 0.38);
  border-radius: var(--radius-small);
  color: var(--color-brass-bright);
  font-size: 0.5rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(13, 16, 13, 0.72);
}

.reset-button {
  margin-left: auto;
  padding: 0.2rem 0.42rem;
  border: 1px solid rgba(194, 158, 88, 0.3);
  border-radius: var(--radius-small);
  color: var(--color-text-muted);
  font-size: 0.52rem;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(16, 18, 15, 0.65);
  cursor: pointer;
}

.reset-button:hover {
  color: var(--color-parchment);
  border-color: var(--color-brass-bright);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.38rem;
}

.setting-toggle {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.48rem;
  padding: 0.48rem 0.56rem;
  border: 1px solid rgba(192, 154, 82, 0.22);
  border-radius: var(--radius-small);
  background: linear-gradient(180deg, rgba(59, 57, 46, 0.5), rgba(14, 17, 14, 0.72));
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.setting-toggle--active {
  border-color: rgba(134, 188, 177, 0.54);
  box-shadow: 0 0 0 1px rgba(61, 117, 111, 0.13) inset;
}

.setting-toggle:focus-within {
  outline: 3px solid var(--color-brass-bright);
  outline-offset: 2px;
}

.setting-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-light {
  width: 0.72rem;
  aspect-ratio: 1;
  border: 1px solid rgba(207, 174, 107, 0.5);
  border-radius: 50%;
  background: #20221d;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.75) inset;
}

.setting-toggle--active .toggle-light {
  background: var(--color-success);
  box-shadow: 0 0 0.65rem rgba(141, 167, 103, 0.65);
}

.setting-copy {
  min-width: 0;
  display: grid;
  gap: 0.1rem;
}

.setting-copy strong {
  color: var(--color-parchment);
  font-size: clamp(0.56rem, 0.82vw, 0.68rem);
}

.setting-copy small {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: clamp(0.46rem, 0.68vw, 0.56rem);
  line-height: 1.25;
}

.settings-note {
  margin: 0.38rem 0 0;
  color: var(--color-secondary-bright);
  font-size: 0.56rem;
  line-height: 1.35;
}

.match-settings--locked .setting-toggle {
  cursor: default;
}

@media (max-width: 500px), (max-height: 620px) {
  .setting-copy small {
    display: none;
  }

  .setting-toggle {
    min-height: 2.25rem;
    padding-block: 0.35rem;
  }
}

@media (max-height: 420px) {
  .settings-heading { margin-bottom: 0.24rem; }
  .setting-toggle { min-height: 1.9rem; padding: 0.24rem 0.4rem; }
  .settings-grid { gap: 0.24rem; }
  .settings-note { display: none; }
}
</style>
