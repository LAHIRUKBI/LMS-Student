"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // පෙරනිමි බ්‍රවුසර prompt එක වැළැක්වීම
      e.preventDefault();
      // event එක state එකකට ගබඩා කිරීම
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Install prompt එක පෙන්වීම
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // App එක Install කළ හැකි උපාංග/බ්‍රවුසර වල පමණක් බටනය පෙන්වීම
  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
    >
      Get App
    </button>
  );
}