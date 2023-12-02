import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'
import { GitHubProvider } from 'tinacms-gitprovider-github'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string
const owner = (process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER) as string
const repo = (process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG) as string
const branch = (process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main') as string

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch,
        owner,
        repo,
        token,
      }),
      databaseAdapter: new MongodbLevel({
        collectionName: 'tinacms',
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI || '',
      }),
      namespace: branch,
    })
