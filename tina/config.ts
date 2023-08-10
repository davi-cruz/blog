import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  client: { skip: true },
  branch,
  clientId: "1873d60e-febb-4ad3-811b-05b308294791", // Get this from tina.io
  token: "bcd915b7ef0e43f43fa3f78caa0f01de573c63a6", // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "static",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "static",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "namespace",
            label: "Namespace",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Published on",
            ui: {
              timeFormat: "HH:mm",
            },
            required: true,
          },
          {
            type: "datetime",
            name: "last_modified_at",
            label: "Last modified at",
            required: false,
            ui: {
              timeFormat: "HH:mm",
            },
          },
          {
            type: "image",
            name: "featuredImage",
            label: "Featured Image",
            required: true,
          },
          {
            type: "string",
            name: "language",
            label: "Language",
            required: true,
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "langs",
        label: "Languages",
        path: "content/langs",
        format: "yaml",
        fields: [
          { type: "string", name: "name", label: "Name",  required: true, isTitle: true },
          { type: "string", name: "displayName", label: "DisplayName", required: true },
        ],
      },
    ],
  },
});
