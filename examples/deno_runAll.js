
const scriptDirectory = './'//dirname(fileURLToPath(import.meta.url))+pathSep
const stopOnError = false
let numErrors = 0

const dirents = Deno.readDirSync(scriptDirectory, {withFileTypes: true})
for (const dirent of dirents) {
  if (dirent.isFile) {
    if (dirent.name.startsWith('example_') && dirent.name.endsWith('.js')) {
      console.log('Running '+dirent.name+'... ')
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
  // Deno.exitCode = 1
  console.error('There were '+numErrors+' failed examples!')
} else {
  console.log('Done.')
}
