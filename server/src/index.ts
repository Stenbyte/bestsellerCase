import { createApp } from './app.js'
import { hydrateUploadedPaths } from './store/uploads.js'

hydrateUploadedPaths()

const port = Number(process.env.PORT) || 3000
const app = createApp()

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
