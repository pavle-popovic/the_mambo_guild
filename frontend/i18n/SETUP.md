# i18n Setup Instructions

## 1. Install next-intl

```bash
cd frontend
npm install next-intl
```

## 2. Add plugin to next.config.ts

```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  images: { /* ...existing remotePatterns... */ },
};

export default withNextIntl(nextConfig);
```

## 3. Wrap app/layout.tsx

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LocaleProvider } from '@/i18n/client';
import { LOCALE_META } from '@/i18n/config';

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const meta = LOCALE_META[locale as keyof typeof LOCALE_META];

  return (
    <html lang={locale} dir={meta?.dir ?? 'ltr'}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider initialLocale={locale as any}>
            {children}
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## 4. Use translations in components

### Server Components
```tsx
import { useTranslations } from 'next-intl';

export default function CoursesPage() {
  const t = useTranslations('courses');
  return <h1>{t('title')}</h1>;
}
```

### Client Components
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function LoginButton() {
  const t = useTranslations('auth.login');
  return <button>{t('submit')}</button>;
}
```

## 5. Add LocaleSwitcher to NavBar

```tsx
import LocaleSwitcher from '@/components/LocaleSwitcher';

// Inside NavBar JSX:
<LocaleSwitcher compact />           // flag + chevron only (mobile)
<LocaleSwitcher className="ml-2" /> // flag + native name (desktop)
```

## 6. Use MuxPlayerWithCC for all video lessons

Replace `MuxVideoPlayer` with `MuxPlayerWithCC` in lesson pages.
CC tracks switch automatically when user changes language.
No extra props needed — reads locale from LocaleProvider.

```tsx
import MuxPlayerWithCC from '@/components/MuxPlayerWithCC';
<MuxPlayerWithCC playbackId={lesson.mux_playback_id} />
```

To add VTT tracks to a Mux asset (do once per video per language):
```bash
curl -X POST https://api.mux.com/video/v1/assets/{ASSET_ID}/tracks \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"text","text_type":"subtitles","language_code":"es","url":"https://your-cdn/es.vtt"}'
```
