import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Edit,
  Trash2,
  X,
  Search,
  Plus,
  Upload,
  ImageIcon,
} from "lucide-react";
import CustomSelect from "../../components/common/CustomSelect";
import { userService } from "../../services/userService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    roleId: 2,
    status: "active",
    avatarUrl: null,
  });
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll({ page: 0, size: 100 });
      setUsers(normalizeUsers(response));
      setError("");
    } catch (err) {
      setUsers([]);
      setError(
        "Không thể tải danh sách người dùng: " +
        (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = normalizeUsers(users);

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (user) => normalizeStatus(user.status) === statusFilter,
      );
    }

    setFilteredUsers(filtered);
  };

  const validateForm = () => {
    const errors = {};
    const trimmedUsername = formData.username.trim();
    const trimmedFullName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    const normalizedUsername = trimmedUsername.toLowerCase();
    const currentUserId = selectedUser?.id;

    if (isCreate) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (
        !trimmedUsername ||
        trimmedUsername.length < 3 ||
        trimmedUsername.length > 50 ||
        !usernameRegex.test(trimmedUsername)
      ) {
        errors.username = "Username 3-50 ký tự, chỉ a-z, 0-9, _";
      } else if (
        users.some(
          (user) =>
            user.id !== currentUserId &&
            String(user.username || "").trim().toLowerCase() === normalizedUsername,
        )
      ) {
        errors.username = "Username đã tồn tại";
      }
      if (!formData.password || formData.password.length < 6) {
        errors.password = "Mật khẩu tối thiểu 6 ký tự";
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Xác nhận mật khẩu không được để trống";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    if (!trimmedFullName || trimmedFullName.length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errors.email = "Email không hợp lệ";
    } else if (
      users.some(
        (user) =>
          user.id !== currentUserId &&
          String(user.email || "").trim().toLowerCase() === normalizedEmail,
      )
    ) {
      errors.email = "Email đã tồn tại";
    }

    if (!trimmedPhone) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(trimmedPhone)) {
      errors.phone = "Số điện thoại phải có 10-11 chữ số";
    } else if (
      users.some(
        (user) =>
          user.id !== currentUserId && String(user.phone || "").trim() === trimmedPhone,
      )
    ) {
      errors.phone = "Số điện thoại đã tồn tại";
    }

    if (!trimmedAddress) {
      errors.address = "Địa chỉ không được để trống";
    }

    if (!formData.roleId) {
      errors.roleId = "Vai trò không được để trống";
    }

    if (!formData.status) {
      errors.status = "Trạng thái không được để trống";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsCreate(false);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      roleId: user.role?.id || 2,
      status: (user.status || "active").toLowerCase(),
      avatarUrl: user.avatarUrl || null,
    });
    setImageFile(null);
    setImagePreview(user.avatarUrl || null);
    setValidationErrors({});
    setError("");
    setShowModal(true);
  };

  const handleCreateOpen = () => {
    setSelectedUser(null);
    setIsCreate(true);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      roleId: 2,
      status: "active",
      avatarUrl: null,
    });
    setImageFile(null);
    setImagePreview(null);
    setValidationErrors({});
    setError("");
    setShowModal(true);
  };

  // Image handling functions
  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, avatarUrl: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (userId) => {
    if (!imageFile || !userId) return formData.avatarUrl;
    setUploadingImage(true);
    setError("");
    try {
      const uploadedUser = await userService.uploadAvatar(userId, imageFile);
      const uploadedUrl =
        uploadedUser?.avatarUrl ||
        uploadedUser?.data?.avatarUrl ||
        uploadedUser?.url ||
        null;

      if (!uploadedUrl) {
        throw new Error("Upload avatar thành công nhưng không nhận được URL");
      }

      return uploadedUrl;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Lỗi upload ảnh đại diện";
      setError(`Lỗi tải ảnh lên Cloudinary: ${errorMsg}`);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    // Prevent multiple submissions
    if (uploadingImage) {
      setError("Đang tải ảnh lên Cloudinary, vui lòng chờ...");
      return;
    }

    try {
      if (isCreate) {
        const payload = {
          username: formData.username.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          roleId: formData.roleId,
          status: (formData.status || "active").toUpperCase(),
        };
        const createdUser = await userService.create(payload);
        const createdUserId = createdUser?.id || createdUser?.data?.id;

        // Upload avatar after user is created (backend create API does not accept avatarUrl directly)
        if (imageFile && createdUserId) {
          await uploadImage(createdUserId);
        }
      } else {
        const updatePayload = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          roleId: formData.roleId,
          status: (formData.status || "active").toUpperCase(),
        };
        await userService.update(selectedUser.id, updatePayload);

        // Upload avatar through dedicated avatar API
        if (imageFile) {
          await uploadImage(selectedUser.id);
        }
      }

      setShowModal(false);
      setImageFile(null);
      setImagePreview(null);
      fetchUsers();
    } catch (err) {
      console.error("❌ Submit error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      setError(errorMsg);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await userService.remove(userId);
        fetchUsers();
      } catch (err) {
        setError(
          "Không thể xóa người dùng: " +
          (err.response?.data?.message || err.message),
        );
      }
    }
  };

  const handleStatusToggle = async (userId, newStatus) => {
    try {
      await userService.updateStatus(userId, newStatus);
      fetchUsers();
    } catch (err) {
      setError(
        "Không thể cập nhật trạng thái: " +
        (err.response?.data?.message || err.message),
      );
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await userService.update(userId, { roleId: parseInt(newRoleId) });
      fetchUsers();
    } catch (err) {
      setError(
        "Không thể cập nhật vai trò: " +
        (err.response?.data?.message || err.message),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-slate-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Users size={26} className="text-indigo-600" />
          Quản lý tài khoản hệ thống
        </h1>
        <button
          onClick={handleCreateOpen}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Tạo người dùng
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              variant="status"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Vô hiệu" },
              ]}
            />
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-600">
          Hiển thị <span className="font-semibold">{filteredUsers.length}</span>{" "}
          người dùng
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName || "avatar"}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {user.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CustomSelect
                      value={user.role?.id || 2}
                      onChange={(newRoleId) =>
                        handleRoleChange(user.id, newRoleId)
                      }
                      variant="role"
                      options={[
                        { value: 1, label: "Admin" },
                        { value: 2, label: "Manager" },
                        { value: 3, label: "Cashier" },
                        { value: 4, label: "Inventory Staff" },
                        { value: 5, label: "Sales Staff" },
                      ]}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CustomSelect
                      value={(user.status || "").toLowerCase()}
                      onChange={(newStatus) =>
                        handleStatusToggle(user.id, newStatus)
                      }
                      variant="status"
                      options={[
                        { value: "active", label: "Hoạt động" },
                        { value: "inactive", label: "Vô hiệu" },
                      ]}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Loading overlay during Cloudinary image upload */}
          {uploadingImage && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 rounded-2xl">
              <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" />
                </div>
                <p className="text-slate-900 font-semibold mb-1">Đang tải ảnh lên Cloudinary...</p>
                <p className="text-sm text-slate-600">Vui lòng không đóng cửa sổ này</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {isCreate ? "Tạo người dùng mới" : "Chỉnh sửa thông tin người dùng"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {isCreate ? "Điền thông tin đầy đủ để tạo tài khoản mới" : "Cập nhật thông tin chi tiết người dùng"}
                </p>
              </div>
              <button
                onClick={() => !uploadingImage && setShowModal(false)}
                disabled={uploadingImage}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Avatar Section - Left Column */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6 sticky top-32 space-y-4">
                      {/* Avatar Display */}
                      <div className="flex flex-col items-center text-center">
                        {imagePreview ? (
                          <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-white">
                            <img src={imagePreview} alt="Avatar preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg mb-4">
                            <span className="text-5xl font-bold text-white">
                              {formData.fullName?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate w-full">
                          {formData.fullName || "Người dùng"}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 break-words">
                          {formData.email || "email@example.com"}
                        </p>

                        {/* Upload Image Section */}
                        <div className="w-full mb-4">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                          />
                          {imageFile ? (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Upload size={14} /> {uploadingImage ? "Đang tải..." : "Thay ảnh"}
                              </button>
                              <button
                                type="button"
                                onClick={removeImage}
                                disabled={uploadingImage}
                                className="w-full px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Xóa ảnh
                              </button>
                            </div>
                          ) : (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => !uploadingImage && fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${uploadingImage ? "border-slate-300 bg-slate-100 opacity-50" :
                                isDragging
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-slate-300 bg-white hover:bg-slate-50"
                                }`}
                              style={{ pointerEvents: uploadingImage ? "none" : "auto" }}
                            >
                              <ImageIcon size={24} className="mx-auto text-slate-400 mb-1" />
                              <p className="text-xs font-medium text-slate-700">Kéo thả ảnh</p>
                              <p className="text-xs text-slate-500">hoặc bấm để chọn</p>
                            </div>
                          )}
                        </div>

                        <div className="w-full space-y-2">
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs text-slate-700 font-medium">Vai trò</p>
                            <p className="text-sm font-semibold text-indigo-600">
                              {["", "Admin", "Manager", "Cashier", "Inventory Staff", "Sales Staff"][formData.roleId] || "Manager"}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs text-slate-700 font-medium">Trạng thái</p>
                            <p className={`text-sm font-semibold ${formData.status === "active" ? "text-green-600" : "text-red-600"}`}>
                              {formData.status === "active" ? "Hoạt động" : "Vô hiệu"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Section - Right Columns */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Username & Password (only for create) */}
                    {isCreate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                              setFormData({ ...formData, username: e.target.value })
                            }
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.username ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                            placeholder="nhap_username"
                          />
                          {validationErrors.username && (
                            <p className="text-red-600 text-xs mt-1.5">
                              {validationErrors.username}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({ ...formData, password: e.target.value })
                            }
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.password ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                            placeholder="••••••"
                          />
                          {validationErrors.password && (
                            <p className="text-red-600 text-xs mt-1.5">
                              {validationErrors.password}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Xác nhận mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.confirmPassword ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                            placeholder="••••••"
                          />
                          {validationErrors.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1.5">
                              {validationErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.fullName ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                          placeholder="Nhập họ tên đầy đủ"
                        />
                        {validationErrors.fullName && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {validationErrors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.email ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                          placeholder="example@email.com"
                        />
                        {validationErrors.email && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {validationErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.phone ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                          placeholder="0123456789"
                        />
                        {validationErrors.phone && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {validationErrors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.address ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"}`}
                          placeholder="Nhập địa chỉ"
                        />
                        {validationErrors.address && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {validationErrors.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Vai trò
                        </label>
                        <CustomSelect
                          value={formData.roleId}
                          onChange={(val) =>
                            setFormData({ ...formData, roleId: parseInt(val) })
                          }
                          variant="role"
                          options={[
                            { value: 1, label: "Admin" },
                            { value: 2, label: "Manager" },
                            { value: 3, label: "Cashier" },
                            { value: 4, label: "Inventory Staff" },
                            { value: 5, label: "Sales Staff" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Trạng thái
                        </label>
                        <CustomSelect
                          value={formData.status}
                          onChange={(val) =>
                            setFormData({ ...formData, status: val })
                          }
                          variant="status"
                          options={[
                            { value: "active", label: "Hoạt động" },
                            { value: "inactive", label: "Vô hiệu hóa" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => !uploadingImage && setShowModal(false)}
                    disabled={uploadingImage}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang tải ảnh...
                      </>
                    ) : (
                      isCreate ? "Tạo mới" : "Cập nhật"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const normalizeUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeStatus = (status) => String(status || "").toLowerCase();

export default UserManagement;
