import { config } from 'dotenv'
import { spawn } from 'node:child_process'
import fs from 'node:fs'

const [file, command, ...args] = process.argv.slice(2)
if (!file || !command || !fs.existsSync(file)) {
  console.error('Usage: node scripts/with-env.mjs <private-env-file> <command> [arguments]')
  process.exit(1)
}
config({ path: file, override: true, quiet: true })
const child = spawn(command, args, { env: process.env, stdio: 'inherit' })
child.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})
child.on('exit', (code) => process.exit(code ?? 1))
