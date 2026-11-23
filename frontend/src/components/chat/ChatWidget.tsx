"use client";

import Script from "next/script";

export default function ChatWidget() {
  const injectUrl = process.env.NEXT_PUBLIC_BOTPRESS_INJECT_URL;
  const configUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_URL;

  if (!injectUrl || !configUrl) return null;

  return (
    <>
      <Script src={injectUrl} strategy="lazyOnload" />
      <Script src={configUrl} strategy="lazyOnload" />
    </>
  );
}
