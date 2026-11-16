"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface MailchimpSignupProps {
  heading?: string;
  subheading?: string;
}

type McResponse = { result: string; msg: string };
type McCallback = (response: McResponse) => void;

type WindowCallbackMap = Record<string, McCallback | undefined>;

const getWinMap = () => window as unknown as WindowCallbackMap;

export function MailchimpSignup({
  heading = "Subscribe",
  subheading,
}: MailchimpSignupProps = {}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const callbackRef = useRef<string | null>(null);

  const BASE_URL =
    "https://classicalrevolution.us7.list-manage.com/subscribe/post-json?u=a3476f0ba3a89ad4a4df5c773&id=3498d7ab59&f_id=0014d2e4f0";
  const HONEYPOT_NAME = "b_a3476f0ba3a89ad4a4df5c773_3498d7ab59";

  // Clean up global JSONP callback and injected script on unmount
  useEffect(() => {
    return () => {
      if (callbackRef.current) {
        delete getWinMap()[callbackRef.current];
      }
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.currentTarget;
      const formData = new FormData(form);
      const email = formData.get("EMAIL") as string;
      const fname = formData.get("FNAME") as string;

      if (!email || !fname) {
        setStatus("error");
        setMessage("Please fill in both Email Address and First Name.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("error");
        setMessage("Please enter a valid email address.");
        return;
      }

      setStatus("loading");
      setMessage("");

      const callbackName = `mc_cb_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
      callbackRef.current = callbackName;

      const winMap = getWinMap();
      winMap[callbackName] = (response: McResponse) => {
        delete winMap[callbackName];
        callbackRef.current = null;
        if (scriptRef.current) {
          scriptRef.current.remove();
          scriptRef.current = null;
        }

        if (response.result === "success") {
          setStatus("success");
          setMessage(
            response.msg ||
              "Thanks for subscribing! Please check your inbox to confirm."
          );
          form.reset();
        } else {
          setStatus("error");
          setMessage(
            response.msg || "Something went wrong. Please try again later."
          );
        }
      };

      const params = new URLSearchParams();
      params.set("EMAIL", email);
      params.set("FNAME", fname);
      params.set(HONEYPOT_NAME, "");
      params.set("c", callbackName);

      const script = document.createElement("script");
      script.id = `mc-script-${callbackName}`;
      script.src = `${BASE_URL}&${params.toString()}`;
      script.async = true;
      script.onerror = () => {
        delete getWinMap()[callbackName];
        callbackRef.current = null;
        script.remove();
        scriptRef.current = null;
        setStatus("error");
        setMessage(
          "Failed to reach Mailchimp. Please check your connection and try again."
        );
      };

      scriptRef.current = script;
      document.head.appendChild(script);
    },
    []
  );

  if (status === "success") {
    return (
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          You are subscribed!
        </h3>
        <p className="text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {heading}
        </h3>
        {subheading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {subheading}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="mc-email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            id="mc-email"
            name="EMAIL"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="mc-fname"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            id="mc-fname"
            name="FNAME"
            type="text"
            required
            autoComplete="given-name"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            placeholder="First name"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3 px-4 bg-zinc-900 text-white font-bold uppercase tracking-tighter rounded hover:bg-red-600 dark:hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      {/* Honeypot field — invisible to users, catches bot signups */}
      <input
        type="text"
        name={HONEYPOT_NAME}
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
        aria-hidden="true"
      />
    </form>
  );
}
