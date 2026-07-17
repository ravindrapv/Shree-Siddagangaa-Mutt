"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PrintPortalProps {
  children: React.ReactNode;
}

export default function PrintPortal({ children }: PrintPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
