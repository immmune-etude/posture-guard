import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appDir = join(root, 'dist', 'app')
const outDir = join(root, 'dist', 'extension')

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

cpSync(appDir, outDir, { recursive: true })
cpSync(join(root, 'extension', 'manifest.json'), join(outDir, 'manifest.json'))
cpSync(join(root, 'extension', 'background.js'), join(outDir, 'background.js'))

console.log('Extension build ready at dist/extension')
