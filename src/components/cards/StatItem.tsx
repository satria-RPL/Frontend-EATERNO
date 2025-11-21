// mendefinisikan tipe properti untuk komponen StatItem
interface Props {
  label: string;
  value: string | number;
  color?: string;
}

// komponen StatItem untuk menampilkan item statistik dengan label dan nilai
export default function StatItem({ label, value, color }: Props) {
  return (
    <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
      <span>{label}</span>
      <span className={`font-semibold ${color ?? "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
