import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Minus } from "lucide-react";

export default function CartItemModal({ item, products, onClose, onConfirm }) {
    const siblings = item.isCombo ? [] : products.filter(p => p.productId && p.productId === item.productId);
    const displayUnits = item.isCombo ? [] : (siblings.length > 0 ? siblings : [item]);
    const hasMultipleUnits = displayUnits.length > 1;

    const [selectedProductId, setSelectedProductId] = useState(item.id);
    const [qty, setQty] = useState(item.qty || 1);
    const [price, setPrice] = useState(item.price || 0);
    const [note, setNote] = useState(item.note || "");

    useEffect(() => {
        if (!item.isCombo && selectedProductId !== item.id) {
            const selected = displayUnits.find(s => s.id === selectedProductId);
            if (selected) {
                setPrice(selected.price);
            }
        } else if (selectedProductId === item.id) {
            setPrice(item.price);
        }
    }, [selectedProductId, item.id, item.isCombo, siblings]);

    const unitRefs = useRef({});
    const qtyInputRef = useRef(null);
    const priceInputRef = useRef(null);
    const noteRef = useRef(null);
    const confirmBtnRef = useRef(null);

    const [focusedField, setFocusedField] = useState(hasMultipleUnits ? "unit" : "qty");

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }

            if (document.activeElement === noteRef.current && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                return;
            }

            if (e.key === "Enter" && document.activeElement !== noteRef.current) {
                e.preventDefault();
                confirmBtnRef.current?.click();
                return;
            }

            const focusableFields = [];
            if (hasMultipleUnits) focusableFields.push("unit");
            focusableFields.push("qty");
            focusableFields.push("price");
            focusableFields.push("note");
            focusableFields.push("confirm");

            const currentIndex = focusableFields.indexOf(focusedField);

            if (e.key === "ArrowDown" || e.key === "Tab") {
                if (e.key === "ArrowDown") e.preventDefault();
                if (currentIndex < focusableFields.length - 1) {
                    setFocusedField(focusableFields[currentIndex + 1]);
                }
            } else if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
                if (e.key === "ArrowUp") e.preventDefault();
                if (currentIndex > 0) {
                    setFocusedField(focusableFields[currentIndex - 1]);
                }
            } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                if (focusedField === "unit" && hasMultipleUnits) {
                    e.preventDefault();
                    const pIds = displayUnits.map(s => s.id);
                    const currentUnitIdx = pIds.indexOf(selectedProductId);
                    let nextIdx = currentUnitIdx;
                    if (e.key === "ArrowRight") nextIdx = Math.min(pIds.length - 1, currentUnitIdx + 1);
                    if (e.key === "ArrowLeft") nextIdx = Math.max(0, currentUnitIdx - 1);
                    setSelectedProductId(pIds[nextIdx]);
                    unitRefs.current[pIds[nextIdx]]?.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [focusedField, hasMultipleUnits, onClose, selectedProductId, siblings]);

    useEffect(() => {
        if (focusedField === "unit" && hasMultipleUnits) {
            unitRefs.current[selectedProductId]?.focus();
        } else if (focusedField === "qty") {
            qtyInputRef.current?.focus();
        } else if (focusedField === "price") {
            priceInputRef.current?.focus();
        } else if (focusedField === "note") {
            noteRef.current?.focus();
        } else if (focusedField === "confirm") {
            confirmBtnRef.current?.focus();
        }
    }, [focusedField, hasMultipleUnits, selectedProductId]);

    const handleConfirm = () => {
        let newItem = { ...item };
        if (!item.isCombo && selectedProductId !== item.id) {
            const selected = displayUnits.find(s => s.id === selectedProductId);
            newItem = { ...item, ...selected };
        }
        // Update local fields
        newItem.qty = Number(qty);
        newItem.price = Number(price);
        newItem.note = note;
        onConfirm(newItem);
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 1000,
            display: "flex", justifyContent: "center", alignItems: "center"
        }}>
            <div
                style={{
                    background: "white", padding: "20px", borderRadius: "10px",
                    width: "500px", maxWidth: "90%", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    display: "flex", flexDirection: "column", gap: "15px",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                    <h2 style={{ fontSize: "18px", margin: 0, color: "#333" }}>
                        Cập nhật: {item.name}
                    </h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <X size={20} color="#666" />
                    </button>
                </div>

                {!item.isCombo && displayUnits.length > 0 && (
                    <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#444", marginBottom: "10px" }}>Đơn vị tính</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {displayUnits.map(sib => {
                                const isSelected = selectedProductId === sib.id;
                                const fallbackUnitName = sib.category?.toLowerCase() === 'nước' ? 'Lon' : (sib.category?.toLowerCase() === 'thực phẩm' ? 'Gói' : 'Cái');
                                const unitLabel = sib.unitName || fallbackUnitName;
                                return (
                                    <label
                                        key={sib.id}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "8px",
                                            padding: "8px 12px", borderRadius: "6px",
                                            border: isSelected ? "1px solid #007bff" : "1px solid #ddd",
                                            background: isSelected ? "#f0f7ff" : "white",
                                            cursor: "pointer", fontSize: "14px",
                                            outline: focusedField === "unit" && isSelected ? "2px solid #007bff" : "none"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="unit"
                                            value={sib.id}
                                            checked={isSelected}
                                            onChange={() => { setSelectedProductId(sib.id); setFocusedField("unit"); }}
                                            ref={el => unitRefs.current[sib.id] = el}
                                            style={{ margin: 0 }}
                                        />
                                        {unitLabel} - {sib.price.toLocaleString()}đ
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {item.isCombo && (
                    <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#444", marginBottom: "5px" }}>Danh sách sản phẩm</div>
                        <ul style={{ paddingLeft: "15px", margin: "5px 0", color: "#555", fontSize: "14px", listStyle: "disc" }}>
                            {item.items?.map((cItem, i) => {
                                const pInfo = products.find(p => p.id === cItem.productVariantId);
                                return (
                                    <li key={i}>{pInfo ? pInfo.name : "Sản phẩm"} <span style={{ fontWeight: "bold" }}>x{cItem.quantity}</span></li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#444" }}>Số lượng</span>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
                        <button
                            onClick={() => { setQty(Math.max(1, qty - 1)); setFocusedField("qty"); }}
                            style={{ padding: "8px 12px", background: "#f8f9fa", border: "none", borderRight: "1px solid #ddd", cursor: "pointer", display: "flex", alignItems: "center" }}
                        ><Minus size={14} /></button>
                        <input
                            ref={qtyInputRef}
                            value={qty}
                            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            onFocus={() => setFocusedField("qty")}
                            style={{ width: "50px", textAlign: "center", border: "none", outline: "none", fontSize: "14px" }}
                        />
                        <button
                            onClick={() => { setQty(qty + 1); setFocusedField("qty"); }}
                            style={{ padding: "8px 12px", background: "#f8f9fa", border: "none", borderLeft: "1px solid #ddd", cursor: "pointer", display: "flex", alignItems: "center" }}
                        ><Plus size={14} /></button>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#444" }}>Đơn giá</span>
                    <input
                        ref={priceInputRef}
                        type="number"
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        onFocus={() => setFocusedField("price")}
                        style={{
                            width: "120px", textAlign: "right", padding: "8px 10px",
                            border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px",
                            outline: focusedField === "price" ? "2px solid #007bff" : "none"
                        }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "14px", color: "#444" }}>Ghi chú</span>
                    <textarea
                        ref={noteRef}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        onFocus={() => setFocusedField("note")}
                        placeholder="Nhập ghi chú..."
                        style={{
                            padding: "10px", border: "1px solid #ddd", borderRadius: "6px",
                            fontSize: "14px", resize: "none", height: "60px",
                            outline: focusedField === "note" ? "2px solid #007bff" : "none"
                        }}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "10px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>Thành tiền</span>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>{(qty * price).toLocaleString()}đ</span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                        onClick={onClose}
                        style={{ padding: "8px 16px", background: "none", border: "none", color: "#007bff", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
                    >Hủy</button>
                    <button
                        ref={confirmBtnRef}
                        onClick={handleConfirm}
                        onFocus={() => setFocusedField("confirm")}
                        style={{
                            padding: "8px 16px", background: "#17a2b8", color: "white",
                            border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px",
                            outline: focusedField === "confirm" ? "2px solid #0056b3" : "none"
                        }}
                    >Xác nhận</button>
                </div>
            </div>
        </div>
    );
}
