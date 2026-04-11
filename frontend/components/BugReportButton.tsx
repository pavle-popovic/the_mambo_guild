"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bug, X, Camera, Paperclip, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

// modern-screenshot handles Tailwind v4 oklch() colors, CSS variables, and gradients
// that html2canvas cannot parse. Loaded lazily from CDN — zero bundle cost.
// Fallback order tries jsdelivr first, then unpkg.
//
// SRI hashes pinned to version 4.6.0 specifically. If a CDN is compromised
// or MITM'd, the browser will refuse to execute the modified script. Hashes
// were computed with `openssl dgst -sha384 -binary <file> | openssl base64 -A`
// against both jsdelivr and unpkg to confirm byte-identity. If you bump the
// version, recompute both hashes. We intentionally removed the unpinned
// `modern-screenshot/dist/index.js` fallback because its hash can drift.
const SCREENSHOT_INTEGRITY = "sha384-gGN1lMNOLP39es/9RsdeQtXj8dH/UyIcMRtuOf14OHZjXYzt7gsYXVcJ5enPlRbz";
const SCREENSHOT_WORKER_INTEGRITY = "sha384-4h7W8jMptHY1gzTZbPXHDutCSCYgqneeNsikqrewPPua4uzHFBnZMgL6FLWeSw5p";
const SCREENSHOT_CDNS = [
  "https://cdn.jsdelivr.net/npm/modern-screenshot@4.6.0/dist/index.js",
  "https://unpkg.com/modern-screenshot@4.6.0/dist/index.js",
];
const SCREENSHOT_WORKER_URL = "https://cdn.jsdelivr.net/npm/modern-screenshot@4.6.0/dist/worker.js";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGES = 5;

type Attachment = {
  id: string;
  dataUrl: string;
  label: string;
};

// Lazy-load modern-screenshot from CDN (one-time, with fallbacks)
let _screenshotPromise: Promise<any> | null = null;
let _workerBlobUrl: string | null = null;
let _workerBlobPromise: Promise<string | null> | null = null;

// Browsers block `new Worker(crossOriginUrl)` even with CORS headers,
// so we fetch the worker script as text and turn it into a same-origin blob URL.
function getWorkerBlobUrl(): Promise<string | null> {
  if (_workerBlobUrl) return Promise.resolve(_workerBlobUrl);
  if (_workerBlobPromise) return _workerBlobPromise;

  // Verify the fetched worker against the pinned SRI hash before turning it
  // into a blob URL. Browsers don't apply <script integrity> to Workers, so
  // we enforce it manually here. On mismatch we reject and fall back to
  // main-thread capture (slower but safe).
  _workerBlobPromise = fetch(SCREENSHOT_WORKER_URL, { mode: "cors" })
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const bytes = await r.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-384", bytes);
      // base64-encode the digest and compare against SCREENSHOT_WORKER_INTEGRITY
      const bin = Array.from(new Uint8Array(digest)).map((b) => String.fromCharCode(b)).join("");
      const b64 = btoa(bin);
      const expected = SCREENSHOT_WORKER_INTEGRITY.replace(/^sha384-/, "");
      if (b64 !== expected) {
        throw new Error("worker integrity mismatch — refusing to load");
      }
      return new TextDecoder().decode(bytes);
    })
    .then((src) => {
      const blob = new Blob([src], { type: "application/javascript" });
      _workerBlobUrl = URL.createObjectURL(blob);
      return _workerBlobUrl;
    })
    .catch((e) => {
      console.warn("[BugReport] Worker blob creation failed — falling back to main thread", e);
      _workerBlobPromise = null;
      return null;
    });

  return _workerBlobPromise;
}

function tryLoadFromCdn(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.integrity = SCREENSHOT_INTEGRITY;
    script.onload = () => {
      const lib = (window as any).modernScreenshot;
      if (lib) {
        console.info(`[BugReport] modern-screenshot loaded from ${url}`);
        resolve(lib);
      } else {
        reject(new Error(`Script loaded but window.modernScreenshot not found (${url})`));
      }
    };
    script.onerror = () => reject(new Error(`Network/CORS error loading ${url}`));
    document.head.appendChild(script);
  });
}

async function loadScreenshotLib(): Promise<any> {
  if (typeof window === "undefined") throw new Error("no window");
  if ((window as any).modernScreenshot) return (window as any).modernScreenshot;
  if (_screenshotPromise) return _screenshotPromise;

  _screenshotPromise = (async () => {
    let lastError: unknown = null;
    for (const url of SCREENSHOT_CDNS) {
      try {
        return await tryLoadFromCdn(url);
      } catch (e) {
        console.warn(`[BugReport] CDN failed: ${url}`, e);
        lastError = e;
      }
    }
    _screenshotPromise = null;
    throw new Error(`All CDNs failed. Last error: ${String(lastError)}`);
  })();

  return _screenshotPromise;
}

function getDeviceInfo() {
  if (typeof window === "undefined") {
    return {
      platform: "",
      language: "",
      timezone: "",
      screen: "",
      viewport: "",
      pixel_ratio: 1,
    };
  }
  return {
    platform: navigator.platform || navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixel_ratio: window.devicePixelRatio || 1,
  };
}

export default function BugReportButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capture the page BEFORE opening the modal so the modal isn't in the screenshot
  const openAndCapture = useCallback(async () => {
    setOpen(true);
    setCapturing(true);
    try {
      const [lib, workerBlobUrl] = await Promise.all([
        loadScreenshotLib(),
        getWorkerBlobUrl(),
      ]);
      // Give the click's ripple/focus state a tick to settle
      await new Promise((r) => setTimeout(r, 50));

      const sameOrigin = window.location.origin;

      const isCrossOriginMedia = (el: Element): boolean => {
        const src =
          (el as HTMLImageElement).src ||
          (el as HTMLSourceElement).src ||
          (el as HTMLVideoElement).currentSrc ||
          "";
        if (!src) return false;
        if (src.startsWith("data:") || src.startsWith("blob:")) return false;
        try {
          const u = new URL(src, window.location.href);
          return u.origin !== sameOrigin;
        } catch {
          return false;
        }
      };

      // Detect mobile for smaller output
      const isMobile = window.innerWidth < 768;

      // 1x1 transparent PNG — used as instant placeholder for any cross-origin
      // resource so modern-screenshot doesn't waste time on network fetches
      // that would either 404, CORS-fail, or taint the canvas.
      const EMPTY_PIXEL =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";

      const dataUrl: string = await lib.domToJpeg(document.body, {
        quality: isMobile ? 0.7 : 0.78,
        backgroundColor: "#000000",
        // Cap scale so huge retina screens don't produce huge images.
        scale: isMobile ? 0.75 : Math.min(1, window.devicePixelRatio || 1),
        // Short timeout (in case fetchFn is ever bypassed for same-origin assets).
        timeout: 2500,
        // Skip font embedding — single biggest speedup.
        // modern-screenshot would otherwise download every @font-face asset
        // and inline it. System fonts are fine for a bug report.
        font: false,
        // Offload SVG serialization to web workers via a same-origin blob URL.
        // (Browsers block `new Worker(crossOriginUrl)` even with CORS.)
        workerUrl: workerBlobUrl || null,
        workerNumber: workerBlobUrl ? (isMobile ? 2 : 4) : 0,
        // Short-circuit cross-origin fetches. This is the real speed fix:
        // Mux thumbnails, R2 images, CDN assets in CSS `background-image` URLs —
        // all get an instant 1x1 placeholder instead of waiting for the network.
        // Return `false` to fall back to the default fetcher for same-origin URLs.
        fetchFn: async (url: string) => {
          try {
            const u = new URL(url, window.location.href);
            if (u.origin === sameOrigin) return false; // same-origin → normal fetch
            return EMPTY_PIXEL; // cross-origin → skip
          } catch {
            return false;
          }
        },
        fetch: {
          requestInit: { mode: "cors", credentials: "omit" },
          bypassingCache: false,
          placeholderImage: EMPTY_PIXEL,
        },
        filter: (node: Node) => {
          if (!(node instanceof Element)) return true;
          if (node.hasAttribute("data-bug-report-ignore")) return false;
          // Skip cross-origin <img>, <video>, <source>, <iframe>, <canvas>
          // — they'd render black (CORS-tainted) or hang the capture.
          const tag = node.tagName;
          if (
            tag === "VIDEO" ||
            tag === "IFRAME" ||
            tag === "CANVAS" ||
            tag === "OBJECT" ||
            tag === "EMBED"
          ) {
            return false;
          }
          if ((tag === "IMG" || tag === "SOURCE") && isCrossOriginMedia(node)) {
            return false;
          }
          return true;
        },
      });

      setAttachments((prev) => [
        { id: crypto.randomUUID(), dataUrl, label: "Auto screenshot" },
        ...prev,
      ]);
    } catch (err) {
      console.error("Screenshot capture failed:", err);
      toast.error("Couldn't capture a screenshot automatically — you can still attach one manually.");
    } finally {
      setCapturing(false);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setMessage("");
    setAttachments([]);
    setSuccess(false);
  }, []);

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const addFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 2 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachments((prev) => {
        if (prev.length >= MAX_IMAGES) {
          toast.error(`Max ${MAX_IMAGES} attachments.`);
          return prev;
        }
        return [...prev, { id: crypto.randomUUID(), dataUrl, label: file.name }];
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // Pre-warm the screenshot library on idle so it's ready the instant the user clicks.
  // Uses requestIdleCallback to avoid costing any real performance — only runs
  // when the browser is otherwise idle.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const idle =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => setTimeout(cb, 2000));
    const cancel =
      (window as any).cancelIdleCallback ||
      ((id: any) => clearTimeout(id));
    const handle = idle(() => {
      loadScreenshotLib().catch(() => {});
      getWorkerBlobUrl().catch(() => {});
    });
    return () => cancel(handle);
  }, []);

  // Paste image from clipboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) addFile(file);
        }
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [open, addFile]);

  const handleFilesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(addFile);
    e.target.value = "";
  };

  const submit = async () => {
    if (message.trim().length < 3) {
      toast.error("Please describe the bug (at least 3 characters).");
      return;
    }
    setSubmitting(true);
    try {
      const device = getDeviceInfo();
      const reporterEmail = email.trim() || (user ? `user-${user.id}@themamboguild.internal` : null);
      const reporterName = user ? `${user.first_name} ${user.last_name}`.trim() : null;

      await apiClient.submitBugReport({
        message: message.trim(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        device,
        reporter_email: reporterEmail,
        reporter_name: reporterName,
        screenshots: attachments.map((a) => a.dataUrl),
      });

      setSuccess(true);
      toast.success("Bug report sent — thank you!");
      setTimeout(close, 1500);
    } catch (err: any) {
      console.error("Bug report failed:", err);
      toast.error(err?.message || "Failed to send bug report. Please email support@themamboguild.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating trigger button — top-right, clears navbar and iOS safe-area insets */}
      <button
        type="button"
        data-bug-report-ignore
        onClick={openAndCapture}
        aria-label="Report a bug"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)",
          left: "calc(env(safe-area-inset-left, 0px) + 0.5rem)",
        }}
        className="fixed z-[9998] flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-black/80 active:scale-95 transition-all duration-200"
      >
        <Bug className="h-3.5 w-3.5" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-bug-report-ignore
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
              className="w-full sm:max-w-lg bg-[#0e0e10] border border-[#D4AF37]/30 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-[#D4AF37]" />
                  <h2 className="text-sm font-semibold tracking-widest uppercase text-[#D4AF37]">Report a bug</h2>
                </div>
                <button onClick={close} className="text-white/50 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                {success ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="h-14 w-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-3">
                      <Check className="h-7 w-7 text-[#D4AF37]" />
                    </div>
                    <p className="text-white font-medium">Thank you!</p>
                    <p className="text-white/60 text-sm mt-1">Our team will look into this.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs text-white/60 mb-1.5">What went wrong?</label>
                      <textarea
                        autoFocus
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe the issue. What were you doing when it happened?"
                        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/60 resize-none"
                        maxLength={5000}
                      />
                    </div>

                    {!user && (
                      <div>
                        <label className="block text-xs text-white/60 mb-1.5">Your email (optional, so we can follow up)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/60"
                        />
                      </div>
                    )}

                    {/* Attachments */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60">Attachments</span>
                        <div className="flex items-center gap-3">
                          {capturing && (
                            <span className="flex items-center gap-1.5 text-xs text-white/50">
                              <Loader2 className="h-3 w-3 animate-spin" /> capturing…
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                          >
                            <Paperclip className="h-3 w-3" /> Add image
                          </button>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesInput}
                        className="hidden"
                      />
                      {attachments.length === 0 && !capturing && (
                        <p className="text-xs text-white/30 italic">No attachments yet. You can paste images too.</p>
                      )}
                      {attachments.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {attachments.map((a) => (
                            <div key={a.id} className="relative group rounded-md overflow-hidden border border-white/10 aspect-video bg-black/40">
                              <a href={a.dataUrl} target="_blank" rel="noopener" className="block w-full h-full">
                                <img src={a.dataUrl} alt={a.label} className="w-full h-full object-contain" />
                              </a>
                              <button
                                type="button"
                                onClick={() => removeAttachment(a.id)}
                                className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-0.5">
                                <p className="text-[10px] text-white/70 truncate">{a.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-white/30 leading-relaxed">
                      We'll automatically include your browser, OS, screen size, and the current page URL to help debug.
                    </p>
                  </>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={submitting}
                    className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || capturing || message.trim().length < 3}
                    title={capturing ? "Waiting for screenshot to finish capturing…" : undefined}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#D4AF37] text-black rounded-md hover:bg-[#e6c34a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting || capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    {submitting ? "Sending…" : capturing ? "Capturing…" : "Send report"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
