const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const usd = (n: number) => usdFmt.format(n || 0);
export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
export const dateLabel = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
