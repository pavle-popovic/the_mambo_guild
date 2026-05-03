"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface Props {
    /**
     * What to render while the count is loading or if the API call fails.
     * Defaults to "..." so the surrounding sentence ("Join ... dancers...")
     * still parses while the request is in flight.
     */
    fallback?: React.ReactNode;
    /** CSS class applied to the rendered count span. */
    className?: string;
}

/**
 * Live counter of real registered Mambo Guild accounts.
 *
 * Fetches `/api/stats/registered-count` on mount, displays the number with
 * locale-aware thousands separators. Endpoint is public + cached 5 min at
 * the edge, so this is safe to mount on high-traffic pages (Hero, Pricing).
 *
 * The component renders ONLY the number — surrounding copy ("Join X
 * dancers already in the Guild") stays in the caller so each context
 * can phrase the social-proof line however it wants.
 *
 * Failure mode: silent. If the API call errors or returns 0, the fallback
 * is rendered. Never throws into the React tree.
 */
export default function RegisteredUserCount({
    fallback = "…",
    className = "font-bold text-mambo-gold",
}: Props) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .getRegisteredUserCount()
            .then(({ count: c }) => {
                if (!cancelled && c > 0) setCount(c);
            })
            .catch(() => {
                // Silent fail — fallback stays visible. A counter being
                // briefly missing is far better than tripping an error
                // boundary on a marketing surface.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (count === null) {
        return <span className={className}>{fallback}</span>;
    }
    return <span className={className}>{count.toLocaleString()}</span>;
}
