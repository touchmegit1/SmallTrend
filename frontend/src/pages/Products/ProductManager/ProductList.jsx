import { useEffect, useState } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Package, Eye, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const mockProducts = [
  {
    id: 1,
    name: "Yaourt",
    brand: "Mondelez",
    category: "Sữa chua",
    unit: "Lốc",
    description: "Sản phẩm Yaourt 1kg chất lượng cao",
    status: "available",
    variant_count: 2,
    created_at: "04/02/2026 09:15",
  },
  {
    id: 2,
    name: "Kẹo ổi",
    brand: "Oishi",
    category: "Nước uống",
    unit: "Gói",
    description: "Sản phẩm Kẹo 2kg chất lượng cao",
    status: "available",
    variant_count: 3,
    created_at: "04/02/2026 10:30",
  },
  {
    id: 3,
    name: "Redbull",
    brand: "TH True Milk",
    category: "Nước uống",
    unit: "Cái",
    description: "Sản phẩm Redbull 2kg chất lượng cao",
    status: "available",
    variant_count: 1,
    created_at: "04/02/2026 11:45",
  },
  {
    id: 4,
    name: "Mì tôm",
    brand: "Orion",
    category: "Nước uống",
    unit: "Hộp",
    description: "Sản phẩm Mì tôm 2kg chất lượng cao",
    status: "available",
    variant_count: 4,
    created_at: "04/02/2026 13:00",
  },
  {
    id: 5,
    name: "Number 1",
    brand: "Coca Cola",
    category: "Kem",
    unit: "Lít",
    description: "Sản phẩm Number 1 250g chất lượng cao",
    status: "available",
    variant_count: 2,
    created_at: "04/02/2026 14:30",
  },
];


export function ProductListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredProducts = mockProducts
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || product.category === filterCategory;

      const matchesStatus =
        filterStatus === "all" || product.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at") {
        const [dateA, timeA] = aValue.split(" ");
        const [dayA, monthA, yearA] = dateA.split("/");
        const [dateB, timeB] = bValue.split(" ");
        const [dayB, monthB, yearB] = dateB.split("/");
        aValue = new Date(`${yearA}-${monthA}-${dayA} ${timeA}`);
        bValue = new Date(`${yearB}-${monthB}-${dayB} ${timeB}`);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);

      // tự ẩn sau 3s
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  }, [location.state]);
  return (
    <div className="space-y-6">
      {/* Alter */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="relative flex gap-4 bg-green-50 border border-green-200 rounded-xl px-6 py-4 min-w-105 shadow-sm">
            <CheckCircle className="text-green-600 w-5 h-5" />
            <span className="text-sm font-medium text-gray-800">
              {toastMessage}
            </span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Quản lý sản phẩm
          </h1>
          <p className="text-gray-500 mt-1">
            Tổng số: {filteredProducts.length} sản phẩm
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="success">
            Xuất dữ liệu
          </Button>
          <Button
            onClick={() => navigate("/products/addproduct")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm mới
          </Button>
        </div>

      </div>

      {/* Filters */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardContent className="p-4 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="pl-9 h-10 text-md bg-gray-200 border border-gray-200 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Nước giải khát">Nước giải khát</option>
              <option value="Mì ăn liền">Mì ăn liền</option>
              <option value="Sữa">Sữa</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader >
              <TableRow className="bg-gray-50">
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("name")}
                >
                  Sản phẩm {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("brand")}
                >
                  Thương hiệu {sortField === "brand" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("created_at")}
                >
                  Thời gian tạo {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow className="hover:bg-gray-200" key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <Badge className="bg-neutral-300" variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700">
                      {product.variant_count} biến thể
                    </Badge>

                  </TableCell>
                  {/* <TableCell>
                    {product.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700">Đang bán</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Ngưng bán</Badge>
                    )}
                  </TableCell> */}
                  <TableCell>{product.created_at}</TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate("/products/detail", { state: { product } })}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate("/products/edit", { state: { product } })}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductListScreen