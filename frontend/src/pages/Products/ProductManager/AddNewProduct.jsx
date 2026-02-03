import { useState } from "react";
import { ArrowLeft, Save, Image as ImageIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { useNavigate } from "react-router-dom";

const AddNewProduct = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    unit: "Cái",
    description: "",
    status: "active",
    tax: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (onSave) {
        await onSave(formData); // ✅ chạy được cả async lẫn sync
      }

      navigate("/products", {
        state: {
          message: "Thêm sản phẩm thành công!",
          type: "success",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Lưu sản phẩm thất bại!");
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/products")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Thêm sản phẩm mới
          </h1>
          <p className="text-gray-500 mt-1">
            Điền thông tin chi tiết sản phẩm
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* LEFT */}
          <div className="h-full">
            <Card className="h-full border border-gray-300 rounded-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <Label>
                    Tên sản phẩm <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="Nhập tên sản phẩm"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>
                    Danh mục <span className="text-red-600">*</span>
                  </Label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Nước giải khát">Nước giải khát</option>
                    <option value="Mì ăn liền">Mì ăn liền</option>
                    <option value="Sữa">Sữa</option>
                    <option value="Bánh kẹo">Bánh kẹo</option>
                    <option value="Gia vị">Gia vị</option>
                  </select>
                </div>

                <div>
                  <Label>
                    Thuế <span className="text-red-600">*</span>
                  </Label>
                  <select
                    name="tax"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    value={formData.tax}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn loại thuế</option>
                    <option value="10%">10%</option>
                    <option value="8%">8%</option>
                    <option value="0%">0%</option>
                  </select>
                </div>

                <div>
                  <Label>Thương hiệu</Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="Nhập tên thương hiệu"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Mô tả sản phẩm</Label>
                  <Textarea
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    name="description"
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="h-full">
            <Card className="h-full border border-gray-300 rounded-lg bg-white flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Hình ảnh sản phẩm
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 space-y-4">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    Kéo thả hoặc click để tải ảnh lên
                  </p>
                </div>

                <Button type="button" variant="success" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm ảnh
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
        {/* Actions */}
        <CardContent className=" justify-center p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Lưu sản phẩm
            </Button>
            <Button type="button" variant="danger" className="w-full" onClick={() => navigate("/products")}>
              Hủy
            </Button>
          </div>
        </CardContent>
      </form>
    </div>//end
  );
}

export default AddNewProduct