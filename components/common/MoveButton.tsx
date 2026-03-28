"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import styled from "styled-components";

export default function MoveButton({ path, children }: { path: string; children: ReactNode }) {
  const router = useRouter();

  return <Button onClick={() => router.push(path)}>{children}</Button>;
}

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.75rem;
  background-color: #111827;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #1f2937;
  }
`;
