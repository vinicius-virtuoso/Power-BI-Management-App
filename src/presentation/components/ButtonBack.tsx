"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const ButtonBack = () => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="h-12 px-8 rounded-xl font-bold"
      onClick={() => router.back()}
    >
      <ArrowLeft size={18} />
      Voltar
    </Button>
  );
};
