"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintTriggerButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold gap-2 rounded-xl shadow-md"
    >
      <Printer className="w-4 h-4" />
      Cetak / Simpan PDF (F4 / A4)
    </Button>
  );
}
