import { UsernamePasswordAuthJSProvider } from 'tinacms-authjs/dist/tinacms'
import { PostCollection, TinaUserCollection } from './collections'
import { defineConfig, LocalAuthProvider } from 'tinacms'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

export default defineConfig({
  authProvider: isLocal ? new LocalAuthProvider() : new UsernamePasswordAuthJSProvider(),
  contentApiUrlOverride: '/api/tina/gql',
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
    basePath: '/',
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
