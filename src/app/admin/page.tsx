import type { Metadata } from "next";
import { Package, ShoppingBag, AlertTriangle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl text-primary-text mb-8">
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<ShoppingBag size={24} />} label="Orders Today" value="—" />
        <StatCard icon={<Package size={24} />} label="Pending Fulfilment" value="—" />
        <StatCard icon={<AlertTriangle size={24} />} label="Low Stock Items" value="—" />
        <StatCard icon={<Users size={24} />} label="New Customers" value="—" />
      </div>

      {/* Recent orders placeholder */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-primary-text mb-4">
          Recent Orders
        </h2>
        <p className="text-secondary-text text-sm">
          Connect the database to see real-time orders.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex items-center gap-4">
      <div className="text-gold-accent">{icon}</div>
      <div>
        <p className="text-secondary-text text-sm">{label}</p>
        <p className="font-heading text-2xl text-primary-text">{value}</p>
      </div>
    </div>
  );
}
