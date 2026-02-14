import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, LogOut, Download, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Donation {
  id: string;
  donor_name: string;
  email: string | null;
  message: string | null;
  amount: number;
  reference: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    checkAuth();
    fetchDonations();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate("/admin/login");
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDonations(data as Donation[]);
    setLoading(false);
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (d.status !== "SUCCESS") return false;
      const date = new Date(d.created_at);
      if (dateFrom && date < new Date(dateFrom)) return false;
      if (dateTo && date > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [donations, dateFrom, dateTo]);

  const totalAmount = filteredDonations.reduce((s, d) => s + d.amount, 0);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDonations.forEach((d) => {
      const day = new Date(d.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      map[day] = (map[day] || 0) + d.amount;
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [filteredDonations]);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const exportCSV = () => {
    const header = "Tanggal,Nama,Email,Pesan,Nominal,Referensi,Status\n";
    const rows = filteredDonations.map((d) =>
      `"${new Date(d.created_at).toLocaleString("id-ID")}","${d.donor_name}","${d.email || ""}","${(d.message || "").replace(/"/g, '""')}",${d.amount},"${d.reference}","${d.status}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donasi-deimos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-gradient-gold">DEIMOS</span>
            <span className="text-xs text-muted-foreground ml-2">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 text-secondary-foreground text-sm hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Donasi</span>
            </div>
            <p className="text-2xl font-bold font-display text-gradient-gold">{formatRupiah(totalAmount)}</p>
          </div>
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Jumlah Donasi</span>
            </div>
            <p className="text-2xl font-bold font-display">{filteredDonations.length}</p>
          </div>
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Rata-rata</span>
            </div>
            <p className="text-2xl font-bold font-display">
              {filteredDonations.length > 0 ? formatRupiah(Math.round(totalAmount / filteredDonations.length)) : "Rp0"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40 bg-secondary/50 border-border/50 text-sm"
              placeholder="Dari"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40 bg-secondary/50 border-border/50 text-sm"
              placeholder="Sampai"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card-glass rounded-xl p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Donasi per Hari</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 18% 10%)",
                    border: "1px solid hsl(220 15% 18%)",
                    borderRadius: "8px",
                    color: "hsl(40 20% 90%)",
                  }}
                  formatter={(value: number) => [formatRupiah(value), "Donasi"]}
                />
                <Bar dataKey="amount" fill="hsl(38 90% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display font-semibold">Daftar Donasi</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Memuat...</div>
          ) : filteredDonations.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Belum ada donasi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="text-left p-4 font-medium">Tanggal</th>
                    <th className="text-left p-4 font-medium">Nama</th>
                    <th className="text-left p-4 font-medium">Pesan</th>
                    <th className="text-right p-4 font-medium">Nominal</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4 font-medium">{d.donor_name}</td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">{d.message || "—"}</td>
                      <td className="p-4 text-right font-medium text-primary">{formatRupiah(d.amount)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.status === "SUCCESS"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
