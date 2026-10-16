import { defineStorage } from "@aws-amplify/backend";

/**
 * Gallery media + manifest. Only `admins` can write or delete; the public
 * reads everything through the CloudFront distribution in backend.ts.
 */
export const storage = defineStorage({
  name: "gallery",
  access: allow => ({
    "gallery/*": [allow.groups(["admins"]).to(["read", "write", "delete"])],
  }),
});
