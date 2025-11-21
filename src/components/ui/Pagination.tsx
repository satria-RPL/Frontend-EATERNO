export default function Pagination({ total, perPage, page, setPage }: { total: number; perPage: number; page: number; setPage: (n:number) => void; }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({length: totalPages}, (_,i) => i+1);
  return (
    <div className="flex gap-2 items-center">
      {pages.map(p => (
        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${p===page ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>{p}</button>
      ))}
    </div>
  )
}
