"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className={"absolute inset-0 grid place-content-center"}>
      <div className={"p-4 border border-border rounded-xl max-w-sm"}>
        <div>
          <h1 className={"text-foreground font-medium text-base"}>
            Bir hata oluştu
          </h1>
          <p className={"text-muted-foreground text-sm"}>{error.message}</p>
        </div>
        <div className={"pt-4 flex gap-2"}>
          <Button className={"rounded-full flex-1"} variant={"secondary"} asChild>
            <Link href={"https://dev.hume.ai/"} target={"_blank"}>
              Dokümantasyonu Görüntüle
            </Link>
          </Button>
          <Button className={"rounded-full flex-1"} onClick={reset}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    </div>
  );
}
