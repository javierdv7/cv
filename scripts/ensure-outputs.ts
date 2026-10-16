/**
 * The frontend imports amplify_outputs.json. Amplify Hosting generates it
 * during the backend phase; locally, pull the real one with
 *
 *   npx ampx generate outputs --app-id <id> --branch main
 *
 * and if it's missing, this writes an empty stub so dev/build still work
 * (the gallery renders empty and the admin panel says it's not configured).
 */
const path = "amplify_outputs.json";
if (!(await Bun.file(path).exists())) {
  await Bun.write(path, JSON.stringify({ version: "1.4", custom: {} }, null, 2) + "\n");
  console.log(`wrote stub ${path} (no backend configured)`);
}
