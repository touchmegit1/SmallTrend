import React from 'react'
import { useState } from "react"
import Button from './ProductComponents/button'
import { Plus } from "lucide-react";

const products = [
  {
    id: "1",
    name: "Coca Cola 330ml",
    sku: "CC330",
    barcode: "8934588012345",
    category: "Nước giải khát",
    brand: "Coca Cola",
    unit: "Chai",
    costPrice: 12000,
    retailPrice: 15000,
    wholesalePrice: 13500,
    stock: 245,
  },
  {
    id: "2",
    name: "Mì Hảo Hảo tôm chua cay",
    sku: "HH001",
    barcode: "8934588012346",
    category: "Mì ăn liền",
    brand: "Acecook",
    unit: "Gói",
    costPrice: 3000,
    retailPrice: 4000,
    wholesalePrice: 3500,
    stock: 456,
  },
  {
    id: "3",
    name: "Sữa TH True Milk 1L",
    sku: "TH1000",
    barcode: "8934588012347",
    category: "Sữa",
    brand: "TH True Milk",
    unit: "Hộp",
    costPrice: 28000,
    retailPrice: 32000,
    wholesalePrice: 30000,
    stock: 45,
  },
  {
    id: "4",
    name: "Nước suối Lavie 500ml",
    sku: "LV500",
    barcode: "8934588012348",
    category: "Nước giải khát",
    brand: "Lavie",
    unit: "Chai",
    costPrice: 4500,
    retailPrice: 6000,
    wholesalePrice: 5500,
    stock: 789,
  },
];



const ProductList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery)
  );
  return (
    <div className="p-6 space-y-6">
      <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-500 mt-1">Tổng số: {products.length} sản phẩm</p>
        </div>
        <div className="flex gap-3 ">   
          <Button className="bg-blue-600 hover:bg-blue-700">
            Xuất danh sách
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
    </div>
  )
}

export default ProductList