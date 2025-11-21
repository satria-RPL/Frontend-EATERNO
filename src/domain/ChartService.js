// src/domain/chartService.js

// Pilihan: import statis OR fetch di runtime
import revenueJson from "@/data/revenueData.json";
import sourceJson from "@/data/sourceData.json";

export async function getRevenueRaw() {
  // jika ingin fetch runtime, ganti implementasi:
  // const res = await fetch('/data/revenueData.json');
  // return await res.json();

  return revenueJson; // synchronous / immediate
}

export async function getSourceRaw() {
  return sourceJson;
}
