import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { I18nProvider, detectLocale, loadMessages } from "@/i18n";
import "./index.css";

// Load the visitor's language before the first render, so the page never flashes English
const locale = detectLocale();
loadMessages(locale).then((messages) =>
  createRoot(document.getElementById("root")!).render(
    <I18nProvider initialLocale={locale} initialMessages={messages}>
      <App />
    </I18nProvider>
  )
);
