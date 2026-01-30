import React, { useState } from 'react'
import { Plus, Search } from "lucide-react"
const ProductList = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")


  return (
    <div className="p-6">
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-900'>Quản lý sản phẩm</h1>
          <p className='text-gray-500 mt-1'>Tổng số: {} sản phẩm</p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center'>
          <Plus className="w-4 h-4 mr-2"/>
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Search and Filters */}
     <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default ProductList