import { defineAuth } from "@aws-amplify/backend";

/**
 * Admin login for admin.vargastorres.cv. Self sign-up is disabled in
 * backend.ts — users are created with `aws cognito-idp admin-create-user`
 * and added to the `admins` group.
 */
export const auth = defineAuth({
  loginWith: { email: true },
  groups: ["admins"],
});
