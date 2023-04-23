import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  // get clientId and token from environment variables TINA_PUBLIC_CLIENT_ID & TINA_TOKEN
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "./",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "./",
    },
  },
  schema: {
    collections: [
      {
        name: "post_drafts",
        label: "Post Drafts",
        path: "_drafts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "layout",
            label: "Layout",
            required: false
          },
          {
            type: "datetime",
            name: "date",
            label: "Date Publishing",
            ui: {
              timeFormat: "HH:mm"
            },
            required: false
          },
          {
            type: "datetime",
            name: "last_modified_at",
            label: "Last Modified",
            ui: {
              timeFormat: "HH:mm"
            },
            required: false
          },
          {
            type: "string",
            name: "namespace",
            label: "Namespace",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true
          },
          {
            type: "object",
            name: "header",
            label: "Header",
            fields: [
              {
                type: "image",
                name: "og_image",
                label: "Open Graph Image"
              },
              {
                type: "image",
                name: "teaser",
                label: "Post Teaser Image"
              }
            ]
          },
          {
            type: "string", 
            name: "redirect_from", 
            label: "Redirect from",
            required: false
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          }
        ],
      },
    ],
  },
});
