import { Collection } from 'tinacms'

export const PostCollection: Collection = {
  name: 'post',
  label: 'Post',
  path: 'data/blog',
  format: 'mdx',
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'string',
      label: 'Language',
      name: 'language',
      options: [
        { value: 'en-US', label: 'English' },
        { value: 'pt-BR', label: 'Portuguese' },
      ],
    },
    {
      type: 'string',
      label: 'UniqueID',
      name: 'localeid',
    },
    {
      type: 'datetime',
      label: 'Date Posted',
      name: 'date',
    },
    {
      type: 'datetime',
      label: 'Last Modified',
      name: 'lastmod',
    },
    {
      type: 'string',
      label: 'Tags',
      name: 'tags',
      list: true,
    },
    {
      type: 'boolean',
      label: 'Draft',
      name: 'draft',
    },
    {
      type: 'rich-text',
      label: 'Summary',
      name: 'summary',
    },
    {
      type: 'image',
      label: 'Images',
      name: 'images',
      list: true,
    },
    {
      type: 'string',
      label: 'Autores',
      name: 'authors',
      list: true,
      options: [{ value: 'default', label: 'Davi Cruz' }],
    },
    {
      type: 'string',
      label: 'Layout',
      name: 'layout',
      options: [{ value: 'PostLayout', label: 'Default' }],
    },
    {
      type: 'rich-text',
      label: 'Post Body',
      name: 'body',
      isBody: true,
    },
  ],
}
