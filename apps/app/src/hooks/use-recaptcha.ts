import { useEffect, useState } from "react";
import { env } from "../env";

declare global {
    interface Window {
        grecaptcha?: {
            enterprise: {
                ready(callback: () => void): void;
                execute(
                    siteKey: string,
                    options: { action: string }
                ): Promise<string>;
            };
        };
    }
}

export function useRecaptcha() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (window.grecaptcha?.enterprise) {
            window.grecaptcha.enterprise.ready(() => setIsLoaded(true));
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${env.RECAPTCHA_KEY}`;
        script.async = true;

        script.onload = () => {
            window.grecaptcha?.enterprise.ready(() => {
                setIsLoaded(true);
            });
        };

        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    const executeRecaptcha = async (action: string) => {
        if (!isLoaded || !window.grecaptcha?.enterprise) {
            return null;
        }

        return window.grecaptcha.enterprise.execute(env.RECAPTCHA_KEY, {
            action,
        });
    };

    return { executeRecaptcha, isLoaded };
}