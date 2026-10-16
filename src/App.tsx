import "./index.css";
import { lazy, Suspense } from "react";
import { Boot } from "./Boot";
import { Photos } from "./Photos";

// The admin panel (and Amplify) only loads on admin.vargastorres.cv, or at
// /admin on localhost for development.
const Admin = lazy(() => import("./admin/Admin"));

const path = () => window.location.pathname.replace(/\/+$/, "");

export const isAdminRoute = () =>
  typeof window !== "undefined" &&
  (window.location.hostname.startsWith("admin.") ||
    (window.location.hostname === "localhost" && path() === "/admin"));

export const isPhotosRoute = () => typeof window !== "undefined" && path() === "/photos";

/** Pages that scroll normally instead of the forced-landscape desktop. */
export const isPlainPage = () => isAdminRoute() || isPhotosRoute();

export function App() {
  if (isAdminRoute()) {
    return (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    );
  }
  return isPhotosRoute() ? <Photos /> : <Boot />;
}

export default App;
