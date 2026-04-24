"use client";

/**
 * Thin client-side wrapper around NavBar that pulls the current user from
 * AuthContext and forwards it. Lets server-rendered pages embed the shared
 * navigation while still reflecting authenticated state in the UI.
 *
 * Use this in server components (e.g. article pages with metadata exports)
 * where the page itself cannot call useAuth. In pages that are already
 * "use client" and need the user for other purposes, import NavBar directly
 * and pass user yourself.
 */
import NavBar from "./NavBar";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBarAuth() {
    const { user } = useAuth();
    return <NavBar user={user || undefined} />;
}
