
const scriptDirectory = './'//dirname(fileURLToPath(import.meta.url))+pathSep
const stopOnError = false
let numErrors = 0

const dirents = Deno.readDirSync(scriptDirectory, {withFileTypes: true})
for (const dirent of dirents) {
  if (dirent.isFile) {
    if (dirent.name.startsWith('perf_') && dirent.name.endsWith('.js')) {
      console.log('\nRunning '+dirent.name+'...\n')
      try {
        const module = await import(scriptDirectory+dirent.name)
      } catch (error) {
        console.error(error)
        if (stopOnError) {
          Deno.exit(1)
        }
        numErrors ++
      }
    }
  }
}

if (numErrors) {
  console.error('There were '+numErrors+' failed performance tests! I hope you don\'t have any plans for today...')
} else {
  console.log('No errors found! Take the rest of the day off?')
}
