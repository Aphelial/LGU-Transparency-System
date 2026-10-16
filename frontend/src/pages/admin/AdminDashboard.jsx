import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Banknote,
  FolderKanban,
  Megaphone,
  Plus,
} from "lucide-react";
import {
  Card,
  ErrorState,
  PageHeader,
  PageSkeleton,
  StatCard,
} from "../../components/ui";
import { fmtDate, money, useFetch } from "../../utils";
import { useAuth } from "../../auth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch("/admin/dashboard");
  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "Admin"}`}
        subtitle="A quick look at what needs your attention."
      />
      {loading ? (
        <PageSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total budget"
              value={money(data.total_budget)}
              icon={Banknote}
            />
            <StatCard
              label="Projects"
              value={data.projects}
              icon={FolderKanban}
            />
            <StatCard
              label="Announcements"
              value={data.announcements}
              icon={Megaphone}
            />
            <StatCard
              label="Delayed projects"
              value={data.delayed}
              icon={AlertTriangle}
              accent={data.delayed ? "text-[var(--color-delayed)]" : ""}
            />
          </div>
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gov-forest">
              Quick actions
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/budgets?new=1" className="btn-primary">
                <Plus className="h-4 w-4" />
                Add budget
              </Link>
              <Link to="/admin/projects/create" className="btn-outline">
                <Plus className="h-4 w-4" />
                Add project
              </Link>
              <Link to="/admin/announcements/create" className="btn-outline">
                <Plus className="h-4 w-4" />
                Post announcement
              </Link>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gov-forest">
              Recent activity
            </h2>
            <ul className="divide-y divide-green-50">
              {data.activity.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span>
                    <span className="mr-2 rounded-md bg-malachite-50 px-2 py-0.5 text-xs font-bold text-malachite-800 ring-1 ring-inset ring-malachite-500/40">
                      {a.type}
                    </span>
                    {a.type === "Project" && a.id ? (
                      <Link
                        className="font-semibold text-gov-navy hover:text-gov-forest hover:underline"
                        to={`/admin/projects/${a.id}`}
                      >
                        {a.text}
                      </Link>
                    ) : (
                      a.text
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {fmtDate(a.at)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
