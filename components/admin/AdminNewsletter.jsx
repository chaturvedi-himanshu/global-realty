"use client";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";


export default function AdminNewsletter() {
  const { data, isLoading } = useSWR("/newsletter");

  const handleExport = () => {
    if (!data?.data?.length) { toast.error("No subscribers"); return; }
    const csv = ["Email,Subscribed At", ...data.data.map((s) => `${s.email},${new Date(s.subscribedAt).toLocaleDateString("en-IN")}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    toast.success("Exported");
  };

  return (
    <div className="ap-page-body">
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Newsletter Subscribers</h1>
          <p className="ap-subtitle">{data?.data?.length || 0} active subscribers</p>
        </div>
        <button onClick={handleExport} className="ap-btn-green">Export CSV</button>
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div className="ap-empty">Loading...</div>
        ) : !data?.data?.length ? (
          <div className="ap-empty">No subscribers yet</div>
        ) : (
          <table className="ap-nl-table">
            <thead className="ap-nl-thead">
              <tr>
                <th className="ap-nl-th">#</th>
                <th className="ap-nl-th">Email</th>
                <th className="ap-nl-th">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((sub, i) => (
                <tr key={sub._id} className="ap-nl-tr">
                  <td className="ap-nl-td ap-nl-td--muted">{i + 1}</td>
                  <td className="ap-nl-td">{sub.email}</td>
                  <td className="ap-nl-td ap-nl-td--muted">{new Date(sub.subscribedAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
