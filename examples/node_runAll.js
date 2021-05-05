
import * as fs from 'fs'
import {fileURLToPath} from 'url'
import {dirname, sep as pathSep} from 'path'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))+pathSep
const stopOnError = false
let numErrors = 0

const dirents = fs.readdirSync(scriptDirectory, {withFileTypes: true})
for (const dirent of dirents) {
  if (dirent.isFile()) {
    if (dirent.name.startsWith('example_') && dirent.name.endsWith('.js')) {
      process.stdout.write('Running '+dirent.name+'...\n')
      try {
        await import(scriptDirectory+dirent.name) // this is extremely much faster than child_process.fork
      } catch (error) {
        process.stderr.write('\n'+error)
        if (stopOnError) {
          process.stdout.write('\n')
          process.exit(1)
        }
        numErrors ++
      }
      process.stdout.write('\n')
    }
  }
}

if (numErrors) {
  process.exitCode = 1
  process.stderr.write('\nThere were '+numErrors+' failed examples!\n')
} else {
  process.stdout.write('\nDone.\n')
}
