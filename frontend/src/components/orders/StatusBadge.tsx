const COLORS: Record<string, string> = {
  "Chờ thanh toán": "bg-amber-100 text-amber-800",
  "Chờ duyệt": "bg-sky-100 text-sky-800",
  "Đang xử lý": "bg-teal-100 text-teal-800",
  "Đang giao": "bg-orange-100 text-orange-800",
  "Hoàn thành": "bg-emerald-100 text-emerald-800",
  "Đã huỷ": "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${COLORS[status] ?? "bg-muted text-foreground"}`}>
      {status}
    </span>
  );
}
