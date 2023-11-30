import { Collection } from "tinacms";

export const TinaUserCollection: Collection = {
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  isAuthCollection: true,
  isDetached: true,
  label: "Users",
  name: "user",
  path: "data/users",
  format: "json",
  fields: [
    {
      type: "object",
      name: "users",
      list: true,
      ui: {
        defaultItem: {
          username: "new-user",
          name: "New User",
          password: void 0,
        },
        itemProps: (item) => ({ label: item == null ? void 0 : item.username }),
      },
      fields: [
        {
          type: "string",
          label: "Username",
          name: "username",
          uid: true,
          required: true,
        },
        {
          type: "string",
          label: "Name",
          name: "name",
        },
        {
          type: "string",
          label: "Email",
          name: "email",
        },
        {
          type: "password",
          label: "Password",
          name: "password",
          required: true,
        },
      ],
    },
  ],
};
