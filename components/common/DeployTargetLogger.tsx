"use client";

import { useEffect } from "react";

export default function DeployTargetLogger() {
  useEffect(() => {
    console.log("DEPLOY_TARGET:", process.env.NEXT_PUBLIC_DEPLOY_TARGET);
  }, []);

  return null;
}
