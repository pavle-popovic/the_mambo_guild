"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { captureFbclid } from "@/lib/fbclid";
import { track } from "@/lib/analytics";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function PixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Capture fbclid -> _fbc cookie on every navigation; cheap no-op if it
    // was already written. Belt-and-braces for ad-block-blocked Pixel loads.
    captureFbclid();

    if (!PIXEL_ID) return;

    // PageView — shared id between the browser Pixel and the server CAPI row.
    track("PageView", {
      properties: { path: pathname ?? undefined },
    });
    // Depend on pathname + searchParams so every route change fires once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return null;
}

export default function MetaPixel() {
  if (!PIXEL_ID) {
    // No pixel ID configured — render nothing. Let server-side CAPI run solo.
    return null;
  }

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
          }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <PixelRouteTracker />
      </Suspense>
    </>
  );
}
