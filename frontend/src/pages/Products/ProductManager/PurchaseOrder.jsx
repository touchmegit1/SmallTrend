import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axiosConfig";
import * as XLSX from "xlsx";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ProductComponents/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import {
    FileText,
    Search,
    Package,
    Building2,
    CreditCard,
    Calculator,
    Save,
    CheckCircle2,
    XCircle,
    Plus,
    Trash2,
    ChevronDown,
    AlertTriangle,
    Layers,
    Truck,
    ClipboardList,
    X,
    Upload,
    FileSpreadsheet,
    FileUp,
    Check,
    Eye,
} from "lucide-react";

// mammoth is loaded dynamically to avoid build errors if not installed
let mammothLib = null;

// ═══════════════════════════════════════════════════════════
//  HELPER: Format tiền VND
// ═══════════════════════════════════════════════════════════
const formatVND = (value) => {
    if (value == null || isNaN(value)) return "0 ₫";
    return Number(value).toLocaleString("vi-VN") + " ₫";
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
        return dateStr;
    }
};

// ═══════════════════════════════════════════════════════════
//  STATUS CONFIG
// ═══════════════════════════════════════════════════════════
const CONTRACT_STATUS_MAP = {
    DRAFT: { label: "Nháp", color: "bg-slate-100 text-slate-600" },
    PENDING_APPROVAL: {
        label: "Chờ duyệt",
        color: "bg-amber-100 text-amber-700",
    },
    ACTIVE: {
        label: "Đang hiệu lực",
        color: "bg-emerald-100 text-emerald-700",
    },
    SUSPENDED: { label: "Tạm ngưng", color: "bg-orange-100 text-orange-700" },
    EXPIRED: { label: "Hết hạn", color: "bg-red-100 text-red-700" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
    COMPLETED: {
        label: "Hoàn thành",
        color: "bg-blue-100 text-blue-700",
    },
};

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
function PurchaseOrder() {
    const navigate = useNavigate();

    // ─── State ─────────────────────────────────────────────
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showContractDropdown, setShowContractDropdown] = useState(false);
    const [vatRate, setVatRate] = useState(10);

    // Product items with editable fields
    const [productItems, setProductItems] = useState([]);

    // Batch data per product
    const [batchData, setBatchData] = useState({});

    // Batch modal state
    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [batchModalProductKey, setBatchModalProductKey] = useState(null);

    // ─── File Import State ───────────────────────────────
    const fileInputRef = useRef(null);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importParsing, setImportParsing] = useState(false);
    const [importFileName, setImportFileName] = useState("");
    const [importPreview, setImportPreview] = useState(null);
    // importPreview = { supplierInfo: {...}, products: [...], paymentInfo: {...}, rawText?: string }

    // ─── Load Contracts ────────────────────────────────────
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                setLoading(true);
                const response = await api.get("/supplier-contracts");
                const data = Array.isArray(response.data) ? response.data : [];
                setContracts(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching contracts:", err);
                setError("Không thể tải danh sách hợp đồng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    // ─── Filtered contracts for dropdown ───────────────────
    const filteredContracts = useMemo(() => {
        if (!searchQuery.trim()) return contracts;
        const q = searchQuery.toLowerCase();
        return contracts.filter(
            (c) =>
                (c.contractNumber &&
                    c.contractNumber.toLowerCase().includes(q)) ||
                (c.supplier?.name &&
                    c.supplier.name.toLowerCase().includes(q)) ||
                (c.title && c.title.toLowerCase().includes(q))
        );
    }, [contracts, searchQuery]);

    // ─── Select a contract ─────────────────────────────────
    const handleSelectContract = useCallback((contract) => {
        setSelectedContract(contract);
        setShowContractDropdown(false);
        setSearchQuery("");

        // Initialize product items from the contract
        // Since SupplierContract doesn't have contract items in the backend yet,
        // we'll create mock data based on the contract info.
        // In production, this would come from a ContractItem entity.
        const mockProducts = generateContractProducts(contract);
        setProductItems(mockProducts);
        setBatchData({});
    }, []);

    // ─── Generate mock products from contract ──────────────
    const generateContractProducts = (contract) => {
        // This simulates products coming from a contract.
        // In production, these would be loaded from ContractItem entity.
        const baseProducts = [
            {
                _key: `item_${Date.now()}_1`,
                productName: "Sản phẩm mẫu 1",
                productCode: "SP001",
                unit: "Cái",
                contractQuantity: 100,
                unitPrice: 50000,
                receivedQuantity: 0,
                warehouseLocation: "",
                note: "",
            },
            {
                _key: `item_${Date.now()}_2`,
                productName: "Sản phẩm mẫu 2",
                productCode: "SP002",
                unit: "Hộp",
                contractQuantity: 200,
                unitPrice: 30000,
                receivedQuantity: 0,
                warehouseLocation: "",
                note: "",
            },
            {
                _key: `item_${Date.now()}_3`,
                productName: "Sản phẩm mẫu 3",
                productCode: "SP003",
                unit: "Kg",
                contractQuantity: 50,
                unitPrice: 120000,
                receivedQuantity: 0,
                warehouseLocation: "",
                note: "",
            },
        ];
        return baseProducts;
    };

    // ═══════════════════════════════════════════════════════
    //  FILE IMPORT LOGIC
    // ═══════════════════════════════════════════════════════

    const handleFileSelect = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    }, []);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name;
        const ext = fileName.split(".").pop().toLowerCase();

        if (!["docx", "doc", "xlsx", "xls"].includes(ext)) {
            alert("Chỉ hỗ trợ file Word (.docx) hoặc Excel (.xlsx, .xls)");
            return;
        }

        setImportFileName(fileName);
        setImportParsing(true);
        setImportModalOpen(true);
        setImportPreview(null);

        try {
            if (ext === "docx" || ext === "doc") {
                await parseWordFile(file);
            } else {
                await parseExcelFile(file);
            }
        } catch (err) {
            console.error("Parse error:", err);
            alert("Lỗi khi đọc file: " + err.message);
            setImportModalOpen(false);
        } finally {
            setImportParsing(false);
        }
    }, []);

    // ─── PARSE WORD (.docx) ──────────────────────────────
    const parseWordFile = async (file) => {
        // Dynamically load mammoth if not yet loaded
        if (!mammothLib) {
            try {
                mammothLib = await import("mammoth");
            } catch {
                alert(
                    "Thư viện mammoth chưa được cài. Vui lòng chạy:\nnpm install mammoth\nrồi thử lại."
                );
                setImportModalOpen(false);
                return;
            }
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammothLib.extractRawText({ arrayBuffer });
        const text = result.value || "";

        // Extract supplier info using regex patterns
        const supplierInfo = extractSupplierFromText(text);
        const products = extractProductsFromText(text);
        const paymentInfo = extractPaymentFromText(text);

        setImportPreview({
            supplierInfo,
            products,
            paymentInfo,
            rawText: text.slice(0, 2000), // store first 2000 chars for preview
            source: "word",
        });
    };

    // ─── PARSE EXCEL (.xlsx / .xls) ──────────────────────
    const parseExcelFile = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Try to find a product sheet
        const sheetNames = workbook.SheetNames;
        let productSheet = null;
        let supplierSheet = null;

        for (const name of sheetNames) {
            const lowerName = name.toLowerCase();
            if (
                lowerName.includes("sản phẩm") ||
                lowerName.includes("san pham") ||
                lowerName.includes("product") ||
                lowerName.includes("hàng hóa") ||
                lowerName.includes("hang hoa") ||
                lowerName.includes("danh mục") ||
                lowerName.includes("sheet1")
            ) {
                productSheet = workbook.Sheets[name];
            }
            if (
                lowerName.includes("nhà cung cấp") ||
                lowerName.includes("ncc") ||
                lowerName.includes("supplier") ||
                lowerName.includes("thông tin")
            ) {
                supplierSheet = workbook.Sheets[name];
            }
        }

        // If no matching sheet found, use first sheet
        if (!productSheet) {
            productSheet = workbook.Sheets[sheetNames[0]];
        }

        const rawData = XLSX.utils.sheet_to_json(productSheet, { header: 1 });
        const products = extractProductsFromExcel(rawData);

        let supplierInfo = {};
        if (supplierSheet) {
            const supplierData = XLSX.utils.sheet_to_json(supplierSheet, { header: 1 });
            supplierInfo = extractSupplierFromExcel(supplierData);
        }

        setImportPreview({
            supplierInfo,
            products,
            paymentInfo: {},
            source: "excel",
            sheetNames,
        });
    };

    // ─── TEXT EXTRACTION HELPERS ─────────────────────────
    const extractSupplierFromText = (text) => {
        const info = {};
        const patterns = [
            { key: "name", regex: /(?:tên\s*(?:nhà\s*cung\s*cấp|công\s*ty|bên\s*b))\s*[:\-]?\s*(.+)/i },
            { key: "address", regex: /(?:địa\s*chỉ|đ\/?c)\s*[:\-]?\s*(.+)/i },
            { key: "taxCode", regex: /(?:mã\s*số\s*thuế|mst)\s*[:\-]?\s*([\d\-]+)/i },
            { key: "representative", regex: /(?:người\s*đại\s*diện|đại\s*diện)\s*[:\-]?\s*(.+)/i },
            { key: "phone", regex: /(?:(?:số\s*)?điện\s*thoại|sđt|tel|phone)\s*[:\-]?\s*([\d\s\.\-\+]+)/i },
            { key: "email", regex: /(?:email|e-mail)\s*[:\-]?\s*([^\s]+@[^\s]+)/i },
            { key: "bankName", regex: /(?:ngân\s*hàng|bank)\s*[:\-]?\s*(.+)/i },
            { key: "bankAccount", regex: /(?:số\s*tài\s*khoản|stk|tài\s*khoản)\s*[:\-]?\s*([\d\s\-]+)/i },
            { key: "paymentTerms", regex: /(?:(?:điều\s*khoản|phương\s*thức)\s*thanh\s*toán)\s*[:\-]?\s*(.+)/i },
            { key: "contractNumber", regex: /(?:số\s*(?:hợp\s*đồng|hđ)|hợp\s*đồng\s*số)\s*[:\-]?\s*([^\n]+)/i },
        ];

        for (const { key, regex } of patterns) {
            const match = text.match(regex);
            if (match) {
                info[key] = match[1].trim();
            }
        }
        return info;
    };

    const extractProductsFromText = (text) => {
        const products = [];
        // Try to find tabular data in the text
        // Pattern: number | product name | code | unit | quantity | price
        const lines = text.split("\n");
        let inTable = false;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Detect table header
            if (
                (trimmed.toLowerCase().includes("stt") || trimmed.toLowerCase().includes("sản phẩm")) &&
                (trimmed.toLowerCase().includes("số lượng") || trimmed.toLowerCase().includes("đơn giá") ||
                    trimmed.toLowerCase().includes("đơn vị"))
            ) {
                inTable = true;
                continue;
            }

            if (inTable) {
                // Try splitting by tab or multiple spaces
                const cells = trimmed.split(/\t|\s{2,}/).map((c) => c.trim()).filter(Boolean);

                if (cells.length >= 4) {
                    const sttCandidate = parseInt(cells[0]);
                    if (!isNaN(sttCandidate) && sttCandidate > 0) {
                        products.push({
                            _key: `imp_${Date.now()}_${products.length + 1}`,
                            productName: cells[1] || "",
                            productCode: cells[2] || `SP${String(products.length + 1).padStart(3, "0")}`,
                            unit: cells[3] || "Cái",
                            contractQuantity: parseInt(cells[4]) || 0,
                            unitPrice: parseFloat(String(cells[5] || "0").replace(/[,.]/g, "")) || 0,
                            receivedQuantity: 0,
                            warehouseLocation: "",
                            note: "",
                        });
                    }
                }

                // Stop if we hit a total/summary line
                if (
                    trimmed.toLowerCase().includes("tổng") ||
                    trimmed.toLowerCase().includes("cộng") ||
                    trimmed.toLowerCase().includes("total")
                ) {
                    inTable = false;
                }
            }
        }

        return products;
    };

    const extractPaymentFromText = (text) => {
        const info = {};
        const patterns = [
            { key: "method", regex: /(?:phương\s*thức\s*(?:thanh\s*toán)?|hình\s*thức\s*(?:thanh\s*toán)?)\s*[:\-]?\s*(.+)/i },
            { key: "terms", regex: /(?:thời\s*hạn|kỳ\s*hạn)\s*(?:thanh\s*toán)?\s*[:\-]?\s*(.+)/i },
            { key: "bankName", regex: /(?:ngân\s*hàng|bank)\s*[:\-]?\s*(.+)/i },
            { key: "bankAccount", regex: /(?:số\s*tài\s*khoản|stk)\s*[:\-]?\s*([\d\s\-]+)/i },
        ];
        for (const { key, regex } of patterns) {
            const match = text.match(regex);
            if (match) info[key] = match[1].trim();
        }
        return info;
    };

    // ─── EXCEL EXTRACTION HELPERS ────────────────────────
    const extractProductsFromExcel = (rows) => {
        if (!rows || rows.length === 0) return [];

        // Try to find the header row
        let headerRowIndex = -1;
        let colMap = {};

        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const row = rows[i];
            if (!row) continue;
            const rowStr = row.map((c) => String(c || "").toLowerCase()).join(" ");

            if (
                (rowStr.includes("stt") || rowStr.includes("sản phẩm") || rowStr.includes("tên")) &&
                (rowStr.includes("số lượng") || rowStr.includes("đơn vị") || rowStr.includes("giá") || rowStr.includes("sl"))
            ) {
                headerRowIndex = i;
                // Map columns
                for (let j = 0; j < row.length; j++) {
                    const header = String(row[j] || "").toLowerCase().trim();
                    if (header.includes("stt") || header === "#") colMap.stt = j;
                    else if (header.includes("tên") || header.includes("sản phẩm") || header.includes("hàng hóa") || header.includes("product")) colMap.name = j;
                    else if (header.includes("mã") || header.includes("code")) colMap.code = j;
                    else if (header.includes("đơn vị") || header.includes("đvt") || header.includes("unit")) colMap.unit = j;
                    else if (header.includes("số lượng") || header.includes("sl") || header.includes("qty") || header.includes("quantity")) colMap.qty = j;
                    else if (header.includes("đơn giá") || header.includes("giá") || header.includes("price")) colMap.price = j;
                }
                break;
            }
        }

        // If no header found, assume a default layout: STT | Name | Code | Unit | Qty | Price
        if (headerRowIndex === -1) {
            headerRowIndex = 0; // treat first row as header
            colMap = { stt: 0, name: 1, code: 2, unit: 3, qty: 4, price: 5 };
        }

        const products = [];
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const name = String(row[colMap.name] || "").trim();
            if (!name) continue;

            // Skip total/summary rows
            if (
                name.toLowerCase().includes("tổng") ||
                name.toLowerCase().includes("cộng") ||
                name.toLowerCase().includes("total")
            )
                continue;

            const rawPrice = row[colMap.price];
            let price = 0;
            if (typeof rawPrice === "number") {
                price = rawPrice;
            } else if (rawPrice) {
                price = parseFloat(String(rawPrice).replace(/[,.\s]/g, "")) || 0;
            }

            products.push({
                _key: `imp_${Date.now()}_${products.length + 1}`,
                productName: name,
                productCode: String(row[colMap.code] || `SP${String(products.length + 1).padStart(3, "0")}`).trim(),
                unit: String(row[colMap.unit] || "Cái").trim(),
                contractQuantity: parseInt(row[colMap.qty]) || 0,
                unitPrice: price,
                receivedQuantity: 0,
                warehouseLocation: "",
                note: "",
            });
        }
        return products;
    };

    const extractSupplierFromExcel = (rows) => {
        const info = {};
        for (const row of rows) {
            if (!row || row.length < 2) continue;
            const label = String(row[0] || "").toLowerCase().trim();
            const value = String(row[1] || "").trim();
            if (!label || !value) continue;

            if (label.includes("tên") || label.includes("name") || label.includes("công ty")) info.name = value;
            else if (label.includes("địa chỉ") || label.includes("address")) info.address = value;
            else if (label.includes("mst") || label.includes("thuế") || label.includes("tax")) info.taxCode = value;
            else if (label.includes("đại diện") || label.includes("liên hệ")) info.representative = value;
            else if (label.includes("điện thoại") || label.includes("sđt") || label.includes("phone")) info.phone = value;
            else if (label.includes("email")) info.email = value;
            else if (label.includes("ngân hàng") || label.includes("bank")) info.bankName = value;
            else if (label.includes("tài khoản") || label.includes("stk")) info.bankAccount = value;
        }
        return info;
    };

    // ─── APPLY IMPORTED DATA ─────────────────────────────
    const handleApplyImport = useCallback(() => {
        if (!importPreview) return;

        const { supplierInfo, products, paymentInfo } = importPreview;

        // Build a "virtual" contract from imported data
        const importedContract = {
            id: null,
            contractNumber: supplierInfo.contractNumber || `IMP-${Date.now().toString(36).toUpperCase()}`,
            title: `Imported from ${importFileName}`,
            supplier: {
                name: supplierInfo.name || "(Từ file import)",
                address: supplierInfo.address || "",
                taxCode: supplierInfo.taxCode || "",
                contactPerson: supplierInfo.representative || "",
                phone: supplierInfo.phone || "",
                email: supplierInfo.email || "",
            },
            paymentTerms: paymentInfo?.terms || supplierInfo.paymentTerms || "",
            signedBySupplier: supplierInfo.representative || "",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            signedDate: new Date().toISOString().split("T")[0],
            _importedPayment: {
                method: paymentInfo?.method || "Chuyển khoản",
                terms: paymentInfo?.terms || "",
                bankName: paymentInfo?.bankName || supplierInfo.bankName || "",
                bankAccount: paymentInfo?.bankAccount || supplierInfo.bankAccount || "",
            },
        };

        setSelectedContract(importedContract);

        // Set product items (use imported or fallback to blank items)
        if (products && products.length > 0) {
            setProductItems(products);
        } else {
            setProductItems([
                {
                    _key: `imp_blank_${Date.now()}`,
                    productName: "",
                    productCode: "",
                    unit: "",
                    contractQuantity: 0,
                    unitPrice: 0,
                    receivedQuantity: 0,
                    warehouseLocation: "",
                    note: "",
                },
            ]);
        }

        setBatchData({});
        setImportModalOpen(false);
        setImportPreview(null);
        setImportFileName("");
    }, [importPreview, importFileName]);

    // ─── Update product item fields ────────────────────────
    const updateProductItem = useCallback((_key, field, value) => {
        setProductItems((prev) =>
            prev.map((item) => {
                if (item._key !== _key) return item;
                const updated = { ...item, [field]: value };

                // Validate: receivedQuantity <= contractQuantity
                if (field === "receivedQuantity") {
                    const numVal = parseInt(value) || 0;
                    if (numVal > item.contractQuantity) {
                        updated.receivedQuantity = item.contractQuantity;
                    } else if (numVal < 0) {
                        updated.receivedQuantity = 0;
                    } else {
                        updated.receivedQuantity = numVal;
                    }
                }
                return updated;
            })
        );
    }, []);

    // ─── Batch Management ─────────────────────────────────
    const openBatchModal = useCallback((_key) => {
        setBatchModalProductKey(_key);
        setBatchModalOpen(true);
    }, []);

    const closeBatchModal = useCallback(() => {
        setBatchModalOpen(false);
        setBatchModalProductKey(null);
    }, []);

    const addBatchRow = useCallback((_key) => {
        setBatchData((prev) => ({
            ...prev,
            [_key]: [
                ...(prev[_key] || []),
                {
                    id: `batch_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                    batchCode: "",
                    expiryDate: "",
                    unit: "",
                    quantity: 0,
                    note: "",
                },
            ],
        }));
    }, []);

    const updateBatchRow = useCallback((_key, batchId, field, value) => {
        setBatchData((prev) => ({
            ...prev,
            [_key]: (prev[_key] || []).map((batch) =>
                batch.id === batchId ? { ...batch, [field]: value } : batch
            ),
        }));
    }, []);

    const removeBatchRow = useCallback((_key, batchId) => {
        setBatchData((prev) => ({
            ...prev,
            [_key]: (prev[_key] || []).filter((batch) => batch.id !== batchId),
        }));
    }, []);

    // ─── Financial Calculations ────────────────────────────
    const financials = useMemo(() => {
        const totalGoodsValue = productItems.reduce((sum, item) => {
            return sum + (item.receivedQuantity || 0) * (item.unitPrice || 0);
        }, 0);
        const vatAmount = Math.round((totalGoodsValue * vatRate) / 100);
        const grandTotal = totalGoodsValue + vatAmount;
        return { totalGoodsValue, vatAmount, grandTotal };
    }, [productItems, vatRate]);

    // ─── Actions ───────────────────────────────────────────
    const handleSaveDraft = async () => {
        if (!selectedContract) {
            alert("Vui lòng chọn hợp đồng trước.");
            return;
        }
        if (productItems.every((item) => (item.receivedQuantity || 0) === 0)) {
            alert("Vui lòng nhập số lượng nhận cho ít nhất 1 sản phẩm.");
            return;
        }

        setSaving(true);
        try {
            // Build order data
            const orderData = {
                contractId: selectedContract.id,
                supplierId: selectedContract.supplier?.id,
                status: "DRAFT",
                items: productItems.map((item) => ({
                    productCode: item.productCode,
                    productName: item.productName,
                    unit: item.unit,
                    contractQuantity: item.contractQuantity,
                    receivedQuantity: item.receivedQuantity,
                    unitPrice: item.unitPrice,
                    warehouseLocation: item.warehouseLocation,
                    note: item.note,
                    batches: batchData[item._key] || [],
                })),
                vatRate,
                totalGoodsValue: financials.totalGoodsValue,
                vatAmount: financials.vatAmount,
                grandTotal: financials.grandTotal,
            };

            await api.post("/inventory/purchase-orders", orderData);
            alert("Đã lưu phiếu tạm thành công!");
            navigate("/products/purchaseorder");
        } catch (err) {
            console.error("Save draft error:", err);
            alert("Lỗi khi lưu phiếu tạm: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!selectedContract) {
            alert("Vui lòng chọn hợp đồng trước.");
            return;
        }

        // Validate all received quantities
        const invalidItems = productItems.filter(
            (item) => (item.receivedQuantity || 0) > item.contractQuantity
        );
        if (invalidItems.length > 0) {
            alert("Số lượng nhận không được vượt quá số lượng trong hợp đồng!");
            return;
        }

        if (productItems.every((item) => (item.receivedQuantity || 0) === 0)) {
            alert("Vui lòng nhập số lượng nhận cho ít nhất 1 sản phẩm.");
            return;
        }

        if (
            !window.confirm(
                "Xác nhận nhập hàng? Tồn kho sẽ được cập nhật và không thể hoàn tác."
            )
        ) {
            return;
        }

        setSaving(true);
        try {
            const orderData = {
                contractId: selectedContract.id,
                supplierId: selectedContract.supplier?.id,
                status: "CONFIRMED",
                items: productItems.map((item) => ({
                    productCode: item.productCode,
                    productName: item.productName,
                    unit: item.unit,
                    contractQuantity: item.contractQuantity,
                    receivedQuantity: item.receivedQuantity,
                    unitPrice: item.unitPrice,
                    warehouseLocation: item.warehouseLocation,
                    note: item.note,
                    batches: batchData[item._key] || [],
                })),
                vatRate,
                totalGoodsValue: financials.totalGoodsValue,
                vatAmount: financials.vatAmount,
                grandTotal: financials.grandTotal,
            };

            await api.post("/inventory/purchase-orders/confirm", orderData);
            alert("Đã xác nhận nhập hàng và cập nhật tồn kho thành công!");
            navigate("/inventory/import");
        } catch (err) {
            console.error("Confirm error:", err);
            alert("Lỗi khi xác nhận nhập hàng: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (
            selectedContract &&
            window.confirm("Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.")
        ) {
            setSelectedContract(null);
            setProductItems([]);
            setBatchData({});
            setSearchQuery("");
        } else if (!selectedContract) {
            navigate(-1);
        }
    };

    // ─── Current batch modal product ───────────────────────
    const batchModalProduct = useMemo(() => {
        if (!batchModalProductKey) return null;
        return productItems.find((item) => item._key === batchModalProductKey);
    }, [batchModalProductKey, productItems]);

    // ═══════════════════════════════════════════════════════
    //  RENDER: Loading
    // ═══════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0"></div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        Đang tải dữ liệu hợp đồng...
                    </p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    //  RENDER: Error
    // ═══════════════════════════════════════════════════════
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 font-semibold mb-2">Lỗi tải dữ liệu</p>
                    <p className="text-sm text-slate-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    //  RENDER: Main Page
    // ═══════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ─── PAGE HEADER ──────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Nhập hàng theo hợp đồng
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Goods Receipt — Chọn hợp đồng cung cấp để nhập hàng vào kho
                            </p>
                        </div>
                    </div>
                    {selectedContract && (
                        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1">
                            <FileText className="w-3.5 h-3.5 mr-1.5 inline" />
                            {selectedContract.contractNumber}
                        </Badge>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* ═══════════════════════════════════════════════ */}
                {/* SECTION 1: CHỌN HỢP ĐỒNG                      */}
                {/* ═══════════════════════════════════════════════ */}
                <Card className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-visible">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-indigo-600" />
                                <CardTitle className="text-lg font-bold text-slate-800">
                                    Chọn hợp đồng cung cấp
                                </CardTitle>
                            </div>
                            <button
                                onClick={handleFileSelect}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all shadow-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Import File
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="relative">
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Tìm và chọn hợp đồng <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Nhập mã hợp đồng, tên nhà cung cấp..."
                                    className="w-full h-11 pl-10 pr-10 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    value={
                                        selectedContract
                                            ? `${selectedContract.contractNumber} — ${selectedContract.supplier?.name || ""}`
                                            : searchQuery
                                    }
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowContractDropdown(true);
                                        if (selectedContract) {
                                            setSelectedContract(null);
                                            setProductItems([]);
                                            setBatchData({});
                                        }
                                    }}
                                    onFocus={() => {
                                        if (!selectedContract) setShowContractDropdown(true);
                                    }}
                                />
                                {selectedContract ? (
                                    <button
                                        onClick={() => {
                                            setSelectedContract(null);
                                            setProductItems([]);
                                            setBatchData({});
                                            setSearchQuery("");
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <ChevronDown
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer"
                                        onClick={() => setShowContractDropdown(!showContractDropdown)}
                                    />
                                )}
                            </div>

                            {/* Dropdown */}
                            {showContractDropdown && !selectedContract && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {filteredContracts.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-400">
                                            Không tìm thấy hợp đồng nào
                                        </div>
                                    ) : (
                                        filteredContracts.map((contract) => {
                                            const st = CONTRACT_STATUS_MAP[contract.status] || {
                                                label: contract.status,
                                                color: "bg-slate-100 text-slate-600",
                                            };
                                            return (
                                                <button
                                                    key={contract.id}
                                                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                                                    onClick={() => handleSelectContract(contract)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {contract.contractNumber}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                {contract.supplier?.name || "—"} •{" "}
                                                                {contract.title || ""}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                {formatDate(contract.startDate)} →{" "}
                                                                {formatDate(contract.endDate)}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}
                                                        >
                                                            {st.label}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Contract Overview */}
                        {selectedContract && (
                            <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Mã hợp đồng
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {selectedContract.contractNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Nhà cung cấp
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {selectedContract.supplier?.name || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Ngày hợp đồng
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {formatDate(selectedContract.signedDate || selectedContract.startDate)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Show remaining sections only when a contract is selected */}
                {selectedContract && (
                    <>
                        {/* ═══════════════════════════════════════════ */}
                        {/* SECTION 2: THÔNG TIN NHÀ CUNG CẤP          */}
                        {/* ═══════════════════════════════════════════ */}
                        <Card className="border border-slate-200 rounded-xl bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        Thông tin nhà cung cấp
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <ReadOnlyField
                                        label="Tên nhà cung cấp"
                                        value={selectedContract.supplier?.name}
                                        icon={<Building2 className="w-4 h-4" />}
                                    />
                                    <ReadOnlyField
                                        label="Địa chỉ"
                                        value={selectedContract.supplier?.address}
                                    />
                                    <ReadOnlyField
                                        label="Mã số thuế"
                                        value={selectedContract.supplier?.taxCode}
                                    />
                                    <ReadOnlyField
                                        label="Người đại diện"
                                        value={
                                            selectedContract.signedBySupplier ||
                                            selectedContract.supplier?.contactPerson ||
                                            selectedContract.supplier?.contact_person
                                        }
                                    />
                                    <ReadOnlyField
                                        label="Số điện thoại"
                                        value={selectedContract.supplier?.phone}
                                    />
                                    <ReadOnlyField
                                        label="Email"
                                        value={selectedContract.supplier?.email}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ═══════════════════════════════════════════ */}
                        {/* SECTION 3: DANH MỤC HÀNG HÓA               */}
                        {/* ═══════════════════════════════════════════ */}
                        <Card className="border border-slate-200 rounded-xl bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        Danh mục hàng hóa
                                    </CardTitle>
                                    <span className="text-xs text-slate-400 ml-2">
                                        ({productItems.length} sản phẩm)
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-12">
                                                    STT
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Tên sản phẩm
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                                                    Mã SP
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                                                    ĐVT
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                                                    SL HĐ
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">
                                                    Đơn giá
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                                                    Thành tiền
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50/50 w-24">
                                                    SL nhận
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50/50 w-32">
                                                    Vị trí kho
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50/50 w-32">
                                                    Ghi chú
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                                                    Lô
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productItems.map((item, index) => {
                                                const totalPrice =
                                                    (item.receivedQuantity || 0) * (item.unitPrice || 0);
                                                const isOverLimit =
                                                    (item.receivedQuantity || 0) > item.contractQuantity;

                                                return (
                                                    <tr
                                                        key={item._key}
                                                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${isOverLimit ? "bg-red-50/30" : ""
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3 text-sm text-slate-500 text-center">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-medium text-slate-800">
                                                                {item.productName}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                                {item.productCode}
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 text-center">
                                                            {item.unit}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-700 text-right">
                                                            {item.contractQuantity.toLocaleString("vi-VN")}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-700 text-right">
                                                            {formatVND(item.unitPrice)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
                                                            {formatVND(totalPrice)}
                                                        </td>
                                                        {/* Editable cells */}
                                                        <td className="px-4 py-3 bg-indigo-50/20">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.contractQuantity}
                                                                value={item.receivedQuantity}
                                                                onChange={(e) =>
                                                                    updateProductItem(
                                                                        item._key,
                                                                        "receivedQuantity",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className={`w-full h-9 px-2 text-sm text-center border rounded-md outline-none transition-all ${isOverLimit
                                                                        ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-200"
                                                                        : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                                    }`}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 bg-indigo-50/20">
                                                            <input
                                                                type="text"
                                                                value={item.warehouseLocation}
                                                                onChange={(e) =>
                                                                    updateProductItem(
                                                                        item._key,
                                                                        "warehouseLocation",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="VD: A1-01"
                                                                className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 bg-indigo-50/20">
                                                            <input
                                                                type="text"
                                                                value={item.note}
                                                                onChange={(e) =>
                                                                    updateProductItem(
                                                                        item._key,
                                                                        "note",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Ghi chú..."
                                                                className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => openBatchModal(item._key)}
                                                                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                                title="Quản lý lô hàng"
                                                            >
                                                                <Layers className="w-3.5 h-3.5" />
                                                                {(batchData[item._key] || []).length || "—"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ═══════════════════════════════════════════ */}
                        {/* SECTION 4: CHI TIẾT LÔ HÀNG (inline)       */}
                        {/* ═══════════════════════════════════════════ */}
                        <Card className="border border-slate-200 rounded-xl bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-purple-600" />
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        Chi tiết lô hàng (Batch / Lot)
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                {productItems.map((product) => {
                                    const batches = batchData[product._key] || [];
                                    return (
                                        <div key={product._key} className="mb-6 last:mb-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {product.productName}
                                                    </span>
                                                    <code className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                        {product.productCode}
                                                    </code>
                                                </div>
                                                <button
                                                    onClick={() => addBatchRow(product._key)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Thêm lô
                                                </button>
                                            </div>

                                            {batches.length === 0 ? (
                                                <div className="py-4 text-center text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                                    Chưa có lô hàng nào. Nhấn "Thêm lô" để bắt đầu.
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-purple-50/50">
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">
                                                                    Mã lô
                                                                </th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">
                                                                    Hạn sử dụng
                                                                </th>
                                                                <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                                                    ĐVT
                                                                </th>
                                                                <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                                                    Số lượng
                                                                </th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">
                                                                    Ghi chú
                                                                </th>
                                                                <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase w-12">
                                                                    Xóa
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {batches.map((batch) => (
                                                                <tr
                                                                    key={batch.id}
                                                                    className="border-t border-slate-100 hover:bg-slate-50/50"
                                                                >
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={batch.batchCode}
                                                                            onChange={(e) =>
                                                                                updateBatchRow(
                                                                                    product._key,
                                                                                    batch.id,
                                                                                    "batchCode",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="VD: LOT-001"
                                                                            className="w-full h-8 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="date"
                                                                            value={batch.expiryDate}
                                                                            onChange={(e) =>
                                                                                updateBatchRow(
                                                                                    product._key,
                                                                                    batch.id,
                                                                                    "expiryDate",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            className="w-full h-8 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={batch.unit || product.unit}
                                                                            onChange={(e) =>
                                                                                updateBatchRow(
                                                                                    product._key,
                                                                                    batch.id,
                                                                                    "unit",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            className="w-full h-8 px-2 text-sm text-center border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={batch.quantity}
                                                                            onChange={(e) =>
                                                                                updateBatchRow(
                                                                                    product._key,
                                                                                    batch.id,
                                                                                    "quantity",
                                                                                    parseInt(e.target.value) || 0
                                                                                )
                                                                            }
                                                                            className="w-full h-8 px-2 text-sm text-center border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={batch.note}
                                                                            onChange={(e) =>
                                                                                updateBatchRow(
                                                                                    product._key,
                                                                                    batch.id,
                                                                                    "note",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="Ghi chú lô"
                                                                            className="w-full h-8 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <button
                                                                            onClick={() =>
                                                                                removeBatchRow(product._key, batch.id)
                                                                            }
                                                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                                                            title="Xóa lô"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* ═══════════════════════════════════════════ */}
                        {/* SECTION 5: THÔNG TIN THANH TOÁN             */}
                        {/* ═══════════════════════════════════════════ */}
                        <Card className="border border-slate-200 rounded-xl bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-amber-600" />
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        Thông tin thanh toán
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <ReadOnlyField
                                        label="Phương thức thanh toán"
                                        value={
                                            selectedContract._importedPayment?.method ||
                                            (selectedContract.paymentTerms ? "Chuyển khoản" : "Tiền mặt")
                                        }
                                    />
                                    <ReadOnlyField
                                        label="Điều khoản thanh toán"
                                        value={
                                            selectedContract._importedPayment?.terms ||
                                            selectedContract.paymentTerms ||
                                            "Thanh toán khi giao hàng"
                                        }
                                    />
                                    <ReadOnlyField
                                        label="Ngân hàng"
                                        value={
                                            selectedContract._importedPayment?.bankName ||
                                            "Vietcombank"
                                        }
                                    />
                                    <ReadOnlyField
                                        label="Số tài khoản"
                                        value={
                                            selectedContract._importedPayment?.bankAccount ||
                                            "0123456789"
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ═══════════════════════════════════════════ */}
                        {/* SECTION 6: TỔNG GIÁ TRỊ                    */}
                        {/* ═══════════════════════════════════════════ */}
                        <Card className="border border-slate-200 rounded-xl bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-teal-600" />
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        Tổng giá trị
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="max-w-md ml-auto">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">
                                                Tổng giá trị hàng hóa
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {formatVND(financials.totalGoodsValue)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-600">VAT</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={vatRate}
                                                    onChange={(e) =>
                                                        setVatRate(parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-16 h-7 px-2 text-xs text-center border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                />
                                                <span className="text-xs text-slate-500">%</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {formatVND(financials.vatAmount)}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                            <span className="text-base font-bold text-slate-800">
                                                Tổng cộng
                                            </span>
                                            <span className="text-xl font-bold text-indigo-600">
                                                {formatVND(financials.grandTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ═══════════════════════════════════════════ */}
                        {/* SECTION 7: ACTIONS                          */}
                        {/* ═══════════════════════════════════════════ */}
                        <div className="flex items-center justify-end gap-3 pb-6">
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Đang lưu..." : "Lưu phiếu tạm"}
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {saving ? "Đang xử lý..." : "Xác nhận nhập hàng"}
                            </button>
                        </div>
                    </>
                )}

                {/* Empty State when no contract selected */}
                {!selectedContract && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                            <FileText className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            Chưa chọn hợp đồng
                        </h3>
                        <p className="text-sm text-slate-400 max-w-md text-center">
                            Tìm và chọn một hợp đồng cung cấp hàng hóa ở phần trên để bắt
                            đầu quy trình nhập hàng vào kho.
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* BATCH EDITOR MODAL                                  */}
            {/* ═══════════════════════════════════════════════════ */}
            {batchModalOpen && batchModalProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Quản lý lô hàng
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {batchModalProduct.productName} ({batchModalProduct.productCode})
                                </p>
                            </div>
                            <button
                                onClick={closeBatchModal}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => addBatchRow(batchModalProductKey)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Thêm lô hàng
                                </button>
                            </div>

                            {(batchData[batchModalProductKey] || []).length === 0 ? (
                                <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">Chưa có lô hàng nào</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(batchData[batchModalProductKey] || []).map(
                                        (batch, index) => (
                                            <div
                                                key={batch.id}
                                                className="grid grid-cols-6 gap-3 items-end p-3 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                                        Mã lô
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={batch.batchCode}
                                                        onChange={(e) =>
                                                            updateBatchRow(
                                                                batchModalProductKey,
                                                                batch.id,
                                                                "batchCode",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="LOT-001"
                                                        className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                                        Hạn SD
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={batch.expiryDate}
                                                        onChange={(e) =>
                                                            updateBatchRow(
                                                                batchModalProductKey,
                                                                batch.id,
                                                                "expiryDate",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                                        ĐVT
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={batch.unit || batchModalProduct.unit}
                                                        onChange={(e) =>
                                                            updateBatchRow(
                                                                batchModalProductKey,
                                                                batch.id,
                                                                "unit",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full h-9 px-2 text-sm text-center border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                                        Số lượng
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={batch.quantity}
                                                        onChange={(e) =>
                                                            updateBatchRow(
                                                                batchModalProductKey,
                                                                batch.id,
                                                                "quantity",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full h-9 px-2 text-sm text-center border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                                        Ghi chú
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={batch.note}
                                                        onChange={(e) =>
                                                            updateBatchRow(
                                                                batchModalProductKey,
                                                                batch.id,
                                                                "note",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="..."
                                                        className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md bg-white focus:border-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() =>
                                                            removeBatchRow(batchModalProductKey, batch.id)
                                                        }
                                                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Xóa lô"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeBatchModal}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                            >
                                Hoàn tất
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* IMPORT FILE PREVIEW MODAL                             */}
            {/* ═══════════════════════════════════════════════════ */}
            {importModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <FileUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Import File Hợp Đồng
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-500">{importFileName}</span>
                                        {importPreview && (
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                                                {importPreview.source === "word" ? "Word" : "Excel"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setImportModalOpen(false);
                                    setImportPreview(null);
                                    setImportFileName("");
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {importParsing ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="relative mb-4">
                                        <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
                                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin absolute inset-0"></div>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Đang phân tích file...
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {importFileName}
                                    </p>
                                </div>
                            ) : importPreview ? (
                                <>
                                    {/* Supplier Info Preview */}
                                    {importPreview.supplierInfo && Object.keys(importPreview.supplierInfo).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-600" />
                                                Thông tin nhà cung cấp được trích xuất
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {Object.entries(importPreview.supplierInfo).map(([key, value]) => (
                                                    <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <p className="text-xs text-slate-500 font-medium mb-0.5">
                                                            {{
                                                                name: "Tên NCC",
                                                                address: "Địa chỉ",
                                                                taxCode: "MST",
                                                                representative: "Người đại diện",
                                                                phone: "SĐT",
                                                                email: "Email",
                                                                bankName: "Ngân hàng",
                                                                bankAccount: "Số TK",
                                                                paymentTerms: "ĐK thanh toán",
                                                                contractNumber: "Số HĐ",
                                                            }[key] || key}
                                                        </p>
                                                        <p className="text-sm text-slate-800 font-medium truncate">
                                                            {value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Products Preview */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-blue-600" />
                                            Sản phẩm được trích xuất
                                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                {importPreview.products?.length || 0}
                                            </span>
                                        </h3>
                                        {!importPreview.products || importPreview.products.length === 0 ? (
                                            <div className="py-8 text-center bg-amber-50 border border-amber-200 rounded-lg">
                                                <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                                <p className="text-sm text-amber-700 font-medium">
                                                    Không trích xuất được sản phẩm nào
                                                </p>
                                                <p className="text-xs text-amber-600 mt-1">
                                                    File có thể không chứa bảng sản phẩm hoặc định dạng không nhận dạng được.
                                                    Bạn vẫn có thể import thông tin NCC và nhập sản phẩm thủ công.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-slate-50">
                                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 w-8">#</th>
                                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Tên SP</th>
                                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 w-20">Mã SP</th>
                                                            <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600 w-14">ĐVT</th>
                                                            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 w-16">SL</th>
                                                            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 w-24">Đơn giá</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {importPreview.products.map((product, index) => (
                                                            <tr key={product._key || index} className="border-t border-slate-100">
                                                                <td className="px-3 py-2 text-xs text-slate-500">{index + 1}</td>
                                                                <td className="px-3 py-2 text-sm text-slate-800 font-medium">{product.productName}</td>
                                                                <td className="px-3 py-2">
                                                                    <code className="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                                                        {product.productCode}
                                                                    </code>
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-slate-600 text-center">{product.unit}</td>
                                                                <td className="px-3 py-2 text-sm text-slate-700 text-right">
                                                                    {(product.contractQuantity || 0).toLocaleString("vi-VN")}
                                                                </td>
                                                                <td className="px-3 py-2 text-sm text-slate-700 text-right">
                                                                    {formatVND(product.unitPrice)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Raw Text Preview (for Word files) */}
                                    {importPreview.rawText && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-slate-500" />
                                                Nội dung gốc (preview)
                                            </h3>
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                                                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                                                    {importPreview.rawText}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Excel sheet names */}
                                    {importPreview.sheetNames && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-slate-500 font-medium">Sheets:</span>
                                            {importPreview.sheetNames.map((name) => (
                                                <span
                                                    key={name}
                                                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                                                >
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        {!importParsing && importPreview && (
                            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                                <p className="text-xs text-slate-400">
                                    Kiểm tra dữ liệu trước khi áp dụng. Bạn có thể chỉnh sửa sau khi import.
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setImportModalOpen(false);
                                            setImportPreview(null);
                                            setImportFileName("");
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleApplyImport}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-200"
                                    >
                                        <Check className="w-4 h-4" />
                                        Áp dụng dữ liệu
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
//  SUB-COMPONENT: ReadOnlyField
// ═══════════════════════════════════════════════════════════
function ReadOnlyField({ label, value, icon }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg">
                {icon && <span className="text-slate-400">{icon}</span>}
                <span className="text-sm text-slate-700 truncate">
                    {value || "—"}
                </span>
            </div>
        </div>
    );
}

export default PurchaseOrder;
