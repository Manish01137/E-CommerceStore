const STYLES: Record<string, string> = {
  placed: "bg-sand/70 text-earth-deep",
  processing: "bg-sage/50 text-moss-deep",
  shipped: "bg-moss/25 text-moss-deep",
  delivered: "bg-moss text-almond-light",
  cancelled: "bg-earth/15 text-earth",
  pending: "bg-sand/70 text-earth-deep",
  paid: "bg-moss/25 text-moss-deep",
  failed: "bg-[#8a4a2b]/15 text-[#8a4a2b]",
  refunded: "bg-earth/15 text-earth",
  new: "bg-sage/50 text-moss-deep",
  contacted: "bg-sand/70 text-earth-deep",
  closed: "bg-earth/15 text-earth",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${STYLES[status] ?? "bg-sand/70 text-earth-deep"}`}
    >
      {status}
    </span>
  );
}
