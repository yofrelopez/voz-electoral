"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            // Registration was successful
          },
          function(err) {
            // registration failed
          }
        );
      });
    }
  }, []);

  return null;
}
