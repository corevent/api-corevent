import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { register } from 'tsconfig-paths'

const projectRoot = resolve(__dirname, '../..')
const tsConfig = JSON.parse(readFileSync(join(projectRoot, 'tsconfig.json'), 'utf8')) as {
  compilerOptions: { baseUrl?: string; paths?: Record<string, string[]> }
}

register({
  baseUrl: join(projectRoot, tsConfig.compilerOptions.baseUrl ?? '.'),
  paths: tsConfig.compilerOptions.paths ?? {},
})
