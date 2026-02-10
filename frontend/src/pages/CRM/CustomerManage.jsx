import { useState } from "react";
import { Pencil, Trash2, Eye, Search, Settings, X } from "lucide-react";

const mockCustomers = [
  {
    id: "1",
    name: "John Smith",
    phone: "(555) 123-4567",
    loyaltyPoints: 450,
    totalSpend: 225000,
    purchaseHistory: [
      { id: "p1", date: "2026-02-05", items: "Coffee, Pastry", amount: 155000 },
      { id: "p2", date: "2026-02-01", items: "Sandwich, Drink", amount: 220000 },
    ],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    phone: "(555) 234-5678",
    loyaltyPoints: 820,
    totalSpend: 4100000,
    purchaseHistory: [
      { id: "p3", date: "2026-02-08", items: "Groceries", amount: 850000 },
      { id: "p4", date: "2026-01-28", items: "Snacks, Drinks", amount: 345000 },
    ],
  },
  {
    id: "3",
    name: "Michael Brown",
    phone: "(555) 345-6789",
    loyaltyPoints: 310,
    totalSpend: 1550000,
    purchaseHistory: [
      { id: "p5", date: "2026-02-06", items: "Coffee", amount: 55000 },
    ],
  },
];

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list | edit | history
  const [showSettings, setShowSettings] = useState(false);
  const [loyaltyRate, setLoyaltyRate] = useState(50000);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    loyaltyPoints: 0,
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      loyaltyPoints: customer.loyaltyPoints,
    });
    setViewMode("edit");
  };

  const handleViewHistory = (customer) => {
    setSelectedCustomer(customer);
    setViewMode("history");
  };

  const saveEdit = () => {
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, ...editForm } : c
      )
    );
    setViewMode("list");
    setSelectedCustomer(null);
  };

  const cancel = () => {
    setViewMode("list");
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl mb-6">Customer Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total Customers</div>
            <div className="text-3xl">{totalCustomers}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total Spend</div>
            <div className="text-3xl">
              {totalSpend.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between">
            <div>
              <div className="text-gray-500 text-sm">Loyalty Rate</div>
              <div>{loyaltyRate.toLocaleString("vi-VN")} VNĐ / point</div>
            </div>
            <button onClick={() => setShowSettings(true)}>
              <Settings />
            </button>
          </div>
        </div>

        {viewMode === "list" && (
          <>
            <div className="bg-white p-4 rounded-lg shadow mb-4 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="pl-10 w-full border rounded-lg p-2"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Points</th>
                    <th className="p-3 text-left">Total Spend</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-3">{c.name}</td>
                      <td className="p-3">{c.phone}</td>
                      <td className="p-3">{c.loyaltyPoints}</td>
                      <td className="p-3">
                        {c.totalSpend.toLocaleString("vi-VN")} VNĐ
                      </td>
                      <td className="p-3 flex gap-2 justify-center">
                        <button onClick={() => handleViewHistory(c)}>
                          <Eye />
                        </button>
                        <button onClick={() => handleEdit(c)}>
                          <Pencil />
                        </button>
                        <button onClick={() => handleDelete(c.id)}>
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {viewMode === "edit" && selectedCustomer && (
          <div className="bg-white p-6 rounded-lg shadow max-w-md">
            <input
              className="w-full border p-2 mb-3"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-3"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
            <input
              type="number"
              className="w-full border p-2 mb-3"
              value={editForm.loyaltyPoints}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  loyaltyPoints: Number(e.target.value),
                })
              }
            />
            <div className="flex gap-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={saveEdit}
              >
                Save
              </button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={cancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {viewMode === "history" && selectedCustomer && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl mb-4">{selectedCustomer.name}</h2>
            {selectedCustomer.purchaseHistory.map((p) => (
              <div key={p.id} className="border p-3 rounded mb-2">
                <div>{p.items}</div>
                <div className="text-sm text-gray-500">
                  {new Date(p.date).toLocaleDateString()}
                </div>
                <div>{p.amount.toLocaleString("vi-VN")} VNĐ</div>
              </div>
            ))}
            <button className="mt-4 bg-gray-300 px-4 py-2" onClick={cancel}>
              Back
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl">Loyalty Settings</h2>
              <button onClick={() => setShowSettings(false)}>
                <X />
              </button>
            </div>
            <input
              type="number"
              className="w-full border p-2 mb-4"
              value={loyaltyRate}
              onChange={(e) => setLoyaltyRate(Number(e.target.value))}
            />
            <button
              className="bg-blue-600 text-white w-full py-2 rounded"
              onClick={() => setShowSettings(false)}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
