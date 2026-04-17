import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Mambo Guild — Salsa On2 from Level 0 to 100";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px",
                    background:
                        "radial-gradient(ellipse at center, #1a1208 0%, #000000 70%)",
                    color: "#fff",
                    fontFamily: "serif",
                }}
            >
                <div
                    style={{
                        fontSize: 28,
                        letterSpacing: "0.3em",
                        color: "#D4AF37",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: 40,
                    }}
                >
                    The Mambo Guild
                </div>
                <div
                    style={{
                        fontSize: 96,
                        fontWeight: 800,
                        fontStyle: "italic",
                        lineHeight: 1.05,
                        textAlign: "center",
                        maxWidth: 1000,
                        marginBottom: 24,
                    }}
                >
                    Every move. Every technique.
                </div>
                <div
                    style={{
                        fontSize: 96,
                        fontWeight: 800,
                        fontStyle: "italic",
                        lineHeight: 1.05,
                        color: "#D4AF37",
                        marginBottom: 48,
                    }}
                >
                    Level 0 to 100.
                </div>
                <div
                    style={{
                        fontSize: 28,
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: "sans-serif",
                        fontStyle: "normal",
                    }}
                >
                    Salsa On2 · Structured curriculum · 7-day free trial
                </div>
            </div>
        ),
        { ...size },
    );
}
