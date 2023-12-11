import { UsernamePasswordAuthJSProvider } from 'tinacms-authjs/dist/tinacms'
import { PostCollection, TinaUserCollection } from './collections'
import { defineConfig, LocalAuthProvider } from 'tinacms'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

// Your hosting provider likely exposes this as an environment variable
const tinaClientConfig = defineConfig({
  contentApiUrlOverride: '/api/tina/gql',
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new // Your hosting provider likely exposes this as an environment variable
      UsernamePasswordAuthJSProvider(),
  branch: 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
      static: true,
    },
  },
  schema: {
    collections: [TinaUserCollection, PostCollection],
  },
})

export default tinaClientConfig
