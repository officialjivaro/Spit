import { readFile } from 'node:fs/promises'

// Install Doctor | Checks local prerequisites before dependencies are installed
const minimumNode = [20, 0, 0]
const currentNode = process.versions.node.split('.').map(Number)

function isAtLeast(current, minimum) {
  for (let index = 0; index < minimum.length; index += 1) {
    if ((current[index] || 0) > minimum[index]) return true
    if ((current[index] || 0) < minimum[index]) return false
  }
  return true
}

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exitCode = 1
}

console.log(`Node: ${process.versions.node}`)
console.log(`Platform: ${process.platform} ${process.arch}`)

if (!isAtLeast(currentNode, minimumNode)) {
  fail('SpeedGame requires Node.js 20 or newer. Node.js 22 LTS is recommended.')
} else {
  console.log('✓ Node version is supported.')
}

try {
  const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'))
  const resolvedUrls = Object.values(lock.packages || {})
    .map((entry) => entry?.resolved)
    .filter(Boolean)
  const unexpected = resolvedUrls.filter((url) => {
    try {
      return new URL(url).hostname !== 'registry.npmjs.org'
    } catch {
      return true
    }
  })

  if (unexpected.length > 0) {
    fail(`package-lock.json contains ${unexpected.length} non-public package URL(s).`)
  } else {
    console.log(`✓ Lockfile uses the public npm registry for ${resolvedUrls.length} packages.`)
  }
} catch (error) {
  fail(`Could not validate package-lock.json: ${error.message}`)
}

if (!process.exitCode) {
  console.log('\nReady. Run: npm ci\n')
}
