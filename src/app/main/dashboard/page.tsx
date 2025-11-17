import { logout } from "../../auth/login/actions";
import PagePlaceholder from "@/components/Page-Placeholder";

export default function DashboardPage() {

  const ChartDashboard = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [doughnutData, setDoughnutData] = useState(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const revenueRaw = await getRevenueRaw();
        const sourceRaw = await getSourceRaw();

        const line = buildLineChartData(revenueRaw);
        const bar = buildBarChartData(sourceRaw);
        const dough = buildDoughnutData(sourceRaw);

        if (!mounted) return;
        setLineChartData(line);
        setBarChartData(bar);
        setDoughnutData(dough);
      } catch (err) {
        console.error("Failed to load chart data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

    if (loading) return <div>Loading charts…</div>;
  // return <PagePlaceholder pageName="Dashboard" />;
  return (
    <div className="p-4 space-y-6 min-h-screen bg-white">
      <span className="font-bold text-3xl">Manager Dashboard</span>

      {/* Baris Satu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="bg-gray-100 rounded-xl p-6 w-[603] h-[310]">
          <span className="font-semibold text-2xl">
            👋 Hai [Nama Kasir], Statistik Shift Anda
          </span>
          <div className="mt-1 space-y-1 font-medium p-3 text-white">
            <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
              <span>Jam Checkin</span>
              <span>07:00:00</span>
            </div>

            <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
              <span>Waktu Kerja</span>
              <span>05:26:25</span>
            </div>

            <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
              <span>Total Pesanan Yang Diproses</span>
              <span>260</span>
            </div>

            <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
              <span>Total Pesanan Sukses</span>
              <span>501</span>
            </div>

            <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
              <span>Total Uang Masuk</span>
              <span>Rp 50.000.000</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl w-[428] h-[292] ml-24 flex">
          <p className="text-3xl font-light italic text-gray-400">“ ”</p>
        </div>
      </div>

      {/* Baris kedua */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="bg-gray-100 w-[503.4953918457031] h-[335.3791198730469] rounded-lg">
          {doughnutData && <DoughnutChartCard title="Total Income" data={doughnutData} />}
        </div>
        <div className=" bg-gray-100 w-[503.4953918457031] h-[335.3791198730469] rounded-lg"></div>
      </div>

      {/* Baris ketiga */}
      <div className="grid grid-cols-2 p-4 gap-4">
        <div className="bg-gray-100 w-[500] h-[280] rounded-lg"></div>
        <div className=" bg-gray-100 w-[400] h-[250] rounded-lg"></div>
      </div>
    </div>
  );
}
};
