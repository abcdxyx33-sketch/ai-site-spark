import { useEffect, useRef, useCallback } from "react";

// Cloudflare Turnstile test key (always passes) — replace with your real site key
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
}

const TurnstileCaptcha = ({ onVerify, onExpire, theme = "auto" }: TurnstileCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !(window as any).turnstile) return;

    // Clean up existing widget
    if (widgetIdRef.current !== null) {
      try {
        (window as any).turnstile.remove(widgetIdRef.current);
      } catch {}
    }

    widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: onVerify,
      "expired-callback": onExpire,
      theme,
      size: "normal",
    });
  }, [onVerify, onExpire, theme]);

  useEffect(() => {
    // Check if Turnstile script is already loaded
    if ((window as any).turnstile) {
      renderWidget();
      return;
    }

    // Load Turnstile script
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => renderWidget();
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current !== null) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [renderWidget]);

  return <div ref={containerRef} className="flex justify-center my-3" />;
};

export default TurnstileCaptcha;
