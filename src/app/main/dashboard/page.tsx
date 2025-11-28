// export default function DashboardPage() {
//   // return <PagePlaceholder pageName="Dashboard" />;
//   return (
//     <div className="p-4 space-y-6 min-h-screen bg-white">
//       <span className="font-bold text-3xl">Manager Dashboard</span>

//       {/* Baris Satu */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
//         <div className="bg-gray-100 rounded-xl p-6 w-[603] h-[310]">
//           <span className="font-semibold text-2xl">
//             👋 Hai [Nama Kasir], Statistik Shift Anda
//           </span>
//           <div className="mt-1 space-y-1 font-medium p-3 text-white">
//             <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
//               <span>Jam Checkin</span>
//               <span>07:00:00</span>
//             </div>

//             <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
//               <span>Waktu Kerja</span>
//               <span>05:26:25</span>
//             </div>

//             <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
//               <span>Total Pesanan Yang Diproses</span>
//               <span>260</span>
//             </div>

//             <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
//               <span>Total Pesanan Sukses</span>
//               <span>501</span>
//             </div>

//             <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
//               <span>Total Uang Masuk</span>
//               <span>Rp 50.000.000</span>
//             </div>
//           </div>
//         </div>
//         <div className="bg-gray-100 rounded-xl w-[428] h-[292] ml-24 flex">
//           <p className="text-3xl font-light italic text-gray-400">“ ”</p>
//         </div>
//       </div>

//       {/* Baris kedua */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
//         <div className="bg-gray-100 w-[503.4953918457031] h-[335.3791198730469] rounded-lg">
//           {doughnutData && <DoughnutChartCard title="Total Income" data={doughnutData} />}
//         </div>
//         <div className=" bg-gray-100 w-[503.4953918457031] h-[335.3791198730469] rounded-lg"></div>
//       </div>

//       {/* Baris ketiga */}
//       <div className="grid grid-cols-2 p-4 gap-4">
//         <div className="bg-gray-100 w-[500] h-[280] rounded-lg"></div>
//         <div className=" bg-gray-100 w-[400] h-[250] rounded-lg"></div>
//       </div>
//     </div>
//   );
// }
// };

import ShiftStats from "@/components/sections/ShiftStats";
import TotalIncome from "@/components/sections/TotalIncome";
import DaySelling from "@/components/sections/DaySelling";
import TotalBalance from "@/components/sections/TotalBalance";
import BestSeller from "@/components/sections/BestSeller";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("auth_token")?.value ?? null;

  let userName = "";

  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession) as { name?: string };
      if (parsed.name) userName = parsed.name;
    } catch {
      userName = rawSession;
    }
  }
  return (
    <div className="p-2 space-y-4 min-h-screen">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      <div className="flex flex-col justify-between items-center">
        {/* ROW 1 */}
        <div className="flex gap-6 mb-6 pb-3">
          <div className="w-[603px] h-[302px]">
            <ShiftStats userName={userName} />
          </div>

          {/* Card kosong sebelah kanan */}
          <div className="w-[428px] h-[292px] bg-[#F8F8FA] rounded-xl shadow" />
        </div>

        {/* ROW 2 */}
        <div className="flex gap-6 mb-6 py-5">
          <div className="w-[503px] h-[335px]">
            <TotalIncome />
          </div>

          <div className="w-[503px] h-[335px]">
            <DaySelling />
          </div>
        </div>

        {/* ROW 3 */}
        <div className="flex gap-6 py-5">
          <div className="w-[616px] h-[346px]">
            <TotalBalance />
          </div>

          <div className="w-[411px] h-[346px]">
            <BestSeller />
          </div>
        </div>
      </div>
    </div>
  );
}
