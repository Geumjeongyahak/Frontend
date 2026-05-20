"use client";

import { ToastContainer } from "react-toastify";

export default function AppToastContainer() {
  return <ToastContainer position="top-right" autoClose={2000} newestOnTop pauseOnHover />;
}
