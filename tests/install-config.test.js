import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Install Configuration | Prevents private registry URLs from returning to the ZIP
describe('install configuration', () => {
  it('uses only the public npm registry in the lockfile', () => {
    const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
    const resolvedUrls = Object.values(lock.packages || {})
      .map((entry) => entry?.resolved)
      .filter(Boolean)

    expect(resolvedUrls.length).toBeGreaterThan(0)
    expect(
      resolvedUrls.every((url) => new URL(url).hostname === 'registry.npmjs.org')
    ).toBe(true)
  })

  it('documents a supported Node version', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8')
    )

    expect(packageJson.engines.node).toBe('>=20.0.0')
  })
})
