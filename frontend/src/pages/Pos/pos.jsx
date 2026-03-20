import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import EmptyCart from "./EmptyCart";
import Cart from "./Cart";
import PaymentPanel from "./PaymentPanel";
import PaymentModal from "./PaymentModal";
import QRPendingWidget from "./QRPendingWidget";
import Invoice from "./Invoice";
import posService from "../../services/posService";
import api from "../../config/axiosConfig";
import ticketService from "../../services/ticketService";
import eventService from "../../services/eventService";

export default function POS() {
  const searchInputRef = useRef(null);
  const discontinuedModalOpenedAtRef = useRef(0);
  const discontinuedConfirmButtonRef = useRef(null);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('posOrders');
    return saved ? JSON.parse(saved) : [{ id: 1, cart: [], customer: null, usePoints: false }];
  });
  const [activeOrderId, setActiveOrderId] = useState(() => {
    const saved = localStorage.getItem('activeOrderId');
    return saved ? parseInt(saved) : 1;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDiscontinuedModal, setShowDiscontinuedModal] = useState(false);
  const [discontinuedMessage, setDiscontinuedMessage] = useState("");
  const [suspendedOrderCount, setSuspendedOrderCount] = useState(0);
  const [unresolvedTicketCount, setUnresolvedTicketCount] = useState(0);
  const [pendingQROrders, setPendingQROrders] = useState(() => {
    const saved = localStorage.getItem('pendingQROrders');
    return saved ? JSON.parse(saved) : [];
  });
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('posShortcuts');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      payment1: parsed?.payment1 === 'F9' ? 'F10' : (parsed?.payment1 || 'F10'),
      printInvoice: parsed?.printInvoice || 'F9',
      comboFocus: parsed?.comboFocus || 'F11',
      newOrder: parsed?.newOrder || 'F8',
      loyaltyPage: parsed?.loyaltyPage || 'F6',
      closePaymentModal: parsed?.closePaymentModal || 'F4',
      deleteCartItem: parsed?.deleteCartItem || 'F7',
      deleteOrder: parsed?.deleteOrder || 'Delete'
    };
  });

  const activeOrder = orders.find(order => order.id === activeOrderId) || { id: activeOrderId, cart: [], customer: null, usePoints: false };

  // Fetch products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  // Auto focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Reset selected index when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm)) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      ).sort((a, b) => {
        const term = searchTerm.toLowerCase();
        const aStarts = a.name.toLowerCase().startsWith(term) || (a.barcode && a.barcode.toLowerCase().startsWith(term)) || (a.sku && a.sku.toLowerCase().startsWith(term));
        const bStarts = b.name.toLowerCase().startsWith(term) || (b.barcode && b.barcode.toLowerCase().startsWith(term)) || (b.sku && b.sku.toLowerCase().startsWith(term));
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
      if (filtered.length > 0) {
        const exactMatchIndex = filtered.findIndex(p =>
          (p.barcode && p.barcode.toLowerCase() === searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === searchTerm.toLowerCase())
        );
        if (exactMatchIndex >= 0) {
          addToCart(filtered[exactMatchIndex]);
          setSearchTerm('');
          setSelectedProductIndex(-1);
        } else {
          setSelectedProductIndex(0);
        }
      } else {
        setSelectedProductIndex(-1);
      }
    } else {
      setSelectedProductIndex(-1);
    }
  }, [searchTerm, products]);

  // Re-focus when switching orders or closing modals
  useEffect(() => {
    if (searchInputRef.current && !showPaymentModal && !showInvoice && !showShortcuts) {
      searchInputRef.current.focus();
    }
  }, [activeOrderId, showPaymentModal, showInvoice, showShortcuts]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (showDiscontinuedModal) {
      if (e.key === 'Enter') {
        e.preventDefault();
        discontinuedConfirmButtonRef.current?.click();
      }
      return;
    }

    // Không xử lý phím tắt nếu đang focus vào ô input trong modal cài đặt
    if (showShortcuts) return;

    if (e.key === shortcuts.deleteOrder) {
      e.preventDefault();
      if (orders.length > 1) {
        // Find next or previous order id to set active
        const sortedOrders = [...orders].sort((a, b) => a.id - b.id);
        const currentIndex = sortedOrders.findIndex(o => o.id === activeOrderId);
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex + 1;
        const nextId = sortedOrders[nextIndex].id;

        const newOrders = orders.filter(o => o.id !== activeOrderId).sort((a, b) => a.id - b.id);
        setOrders(newOrders);
        setActiveOrderId(nextId);

        // Cập nhật lại transactions trong localStorage
        const orderId = `ORDER_${activeOrderId}`;
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const filteredTransactions = transactions.filter(t => t.orderId !== orderId);
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
      }
      return;
    }

    if (e.key === shortcuts.deleteCartItem) {
      e.preventDefault();
      if (activeOrder.cart.length > 0) {
        updateCart(activeOrder.cart.slice(0, -1));
      }
      return;
    }

    if (filteredProducts.length === 0 && e.key !== 'Enter') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProductIndex(prev =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProductIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const normalizedTerm = (searchTerm || '').trim().toLowerCase();
      if (!normalizedTerm) return;

      const isNumericSearch = /^\d+$/.test(normalizedTerm);

      if (isNumericSearch) {
        const exactCodeMatch = filteredProducts.find((product) =>
          (product.barcode && product.barcode.toLowerCase() === normalizedTerm) ||
          (product.sku && product.sku.toLowerCase() === normalizedTerm)
        );

        if (exactCodeMatch) {
          addToCart(exactCodeMatch);
          setSearchTerm('');
          setSelectedProductIndex(-1);
        } else {
          alert('Không tìm thấy sản phẩm với mã đã nhập.');
        }
        return;
      }

      if (filteredProducts.length > 0) {
        const indexToAdd = selectedProductIndex >= 0 && selectedProductIndex < filteredProducts.length
          ? selectedProductIndex : 0;
        addToCart(filteredProducts[indexToAdd]);
        setSearchTerm('');
        setSelectedProductIndex(-1);
      }
    } else if (e.key === '+' && activeOrder.cart.length > 0) {
      e.preventDefault();
      updateCart(activeOrder.cart.map((item, idx) =>
        idx === activeOrder.cart.length - 1 ? { ...item, qty: item.qty + 1 } : item
      ));
    } else if (e.key === '-' && activeOrder.cart.length > 0) {
      e.preventDefault();
      const lastItem = activeOrder.cart[activeOrder.cart.length - 1];
      if (lastItem.qty > 1) {
        updateCart(activeOrder.cart.map((item, idx) =>
          idx === activeOrder.cart.length - 1 ? { ...item, qty: item.qty - 1 } : item
        ));
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const sortedOrders = [...orders].sort((a, b) => a.id - b.id);
      const currentIndex = sortedOrders.findIndex(o => o.id === activeOrderId);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + sortedOrders.length) % sortedOrders.length
        : (currentIndex + 1) % sortedOrders.length;
      setActiveOrderId(sortedOrders[nextIndex].id);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Bỏ qua phím tắt nếu đang mở modal (ngoại trừ F9/F10 trong payment modal thì đã xử lý bên trong modal)
      if (showPaymentModal || showInvoice || showShortcuts) return;

      if (e.key === shortcuts.payment1 && activeOrder.cart.length > 0) {
        e.preventDefault();
        setShowPaymentModal(true);
      } else if (e.key === shortcuts.printInvoice) {
        e.preventDefault();
        handlePrintCurrentInvoice();
      } else if (e.key === shortcuts.comboFocus) {
        e.preventDefault();
        const comboBtn = document.querySelector('.combo-suggest-btn');
        if (comboBtn) {
          comboBtn.focus();
        }
      } else if (e.key === shortcuts.newOrder) {
        e.preventDefault();
        addNewOrder();
      } else if (e.key === shortcuts.loyaltyPage) {
        e.preventDefault();
        navigate('/crm/loyalty');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeOrder.cart, showPaymentModal, showInvoice, showShortcuts, orders, activeOrderId, shortcuts, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await posService.getAllProducts();
      // Transform backend data to match frontend format
      const transformedProducts = data.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.sellPrice),
        barcode: item.barcode || item.sku,
        sku: item.sku,
        stock: item.stockQuantity || 0,
        category: item.categoryName,
        brand: item.brandName,
        isActive: item.isActive,
        productActive: item.productActive,
        active: item.active,
        status: item.status
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else {
        // Fallback to mock data if backend is not available
        console.warn('Backend not available, using mock data');
        const mockProducts = [
          { id: 1, name: "Coca Cola 330ml", price: 15000, barcode: "123456", sku: "COCA-330", stock: 50 },
          { id: 2, name: "Pepsi 330ml", price: 14000, barcode: "123457", sku: "PEPSI-330", stock: 30 },
          { id: 3, name: "Sting 330ml", price: 12000, barcode: "123458", sku: "STING-330", stock: 25 },
          { id: 4, name: "Bánh mì sandwich", price: 25000, barcode: "123459", sku: "BANH-MI", stock: 10 },
          { id: 5, name: "Sữa tươi Vinamilk", price: 28000, barcode: "123460", sku: "SUA-VNM", stock: 20 },
          { id: 6, name: "Nước suối Lavie", price: 8000, barcode: "123461", sku: "NUOC-LAVIE", stock: 100 }
        ];
        setProducts(mockProducts);
        setCombos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load backend combos separately just in case product load fails slightly or we want them independent
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await api.get('/product-combos');
        setCombos(response.data || []);
      } catch (err) {
        console.error('Error fetching combos:', err);
      }
    };
    fetchCombos();
  }, []);

  useEffect(() => {
    localStorage.setItem('posOrders', JSON.stringify(orders));
    localStorage.setItem('activeOrderId', activeOrderId.toString());
  }, [orders, activeOrderId]);

  useEffect(() => {
    localStorage.setItem('pendingQROrders', JSON.stringify(pendingQROrders));
  }, [pendingQROrders]);

  useEffect(() => {
    const hasUnfinishedTransaction =
      orders.some((order) => Array.isArray(order.cart) && order.cart.length > 0) ||
      pendingQROrders.length > 0;

    if (!hasUnfinishedTransaction) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Bạn đang có giao dịch chưa hoàn thành.';
      return 'Bạn đang có giao dịch chưa hoàn thành.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [orders, pendingQROrders]);

  useEffect(() => {
    const refreshSuspendedOrders = () => {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const waitingOrders = transactions.filter((t) => t.status === 'Chờ thanh toán');
      setSuspendedOrderCount(waitingOrders.length);
    };

    refreshSuspendedOrders();
    const intervalId = setInterval(refreshSuspendedOrders, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const refreshUnresolvedTickets = async () => {
      try {
        const tickets = await ticketService.getAllTickets();
        const unresolved = (Array.isArray(tickets) ? tickets : []).filter(
          (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        );
        setUnresolvedTicketCount(unresolved.length);
      } catch (error) {
        console.error('Error fetching unresolved tickets:', error);
      }
    };

    refreshUnresolvedTickets();
    const intervalId = setInterval(refreshUnresolvedTickets, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const notifications = [
    ...(suspendedOrderCount > 0
      ? [{
          id: 'suspended-orders',
          title: 'Đơn treo chưa thanh toán',
          description: `Hiện có ${suspendedOrderCount} đơn đang chờ thanh toán.`,
          path: '/pos/history'
        }]
      : []),
    ...(unresolvedTicketCount > 0
      ? [{
          id: 'unresolved-tickets',
          title: 'Ticket chưa xử lý',
          description: `Hiện có ${unresolvedTicketCount} ticket đang mở/chưa xử lý.`,
          path: '/pos/complain'
        }]
      : [])
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    const term = searchTerm.toLowerCase();
    const aStarts = a.name.toLowerCase().startsWith(term) || (a.barcode && a.barcode.toLowerCase().startsWith(term)) || (a.sku && a.sku.toLowerCase().startsWith(term));
    const bStarts = b.name.toLowerCase().startsWith(term) || (b.barcode && b.barcode.toLowerCase().startsWith(term)) || (b.sku && b.sku.toLowerCase().startsWith(term));
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });

  const closeDiscontinuedModal = () => {
    setShowDiscontinuedModal(false);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const showUnavailableWarning = (message) => {
    discontinuedModalOpenedAtRef.current = Date.now();
    setDiscontinuedMessage(message);
    setShowDiscontinuedModal(true);
  };

  const showDiscontinuedWarning = (itemName) => {
    showUnavailableWarning(`${itemName || 'Sản phẩm này'} đã ngừng bán. Vui lòng chọn sản phẩm khác.`);
  };

  const getPositiveNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getItemPrice = (item) => {
    return getPositiveNumber(item?.sellPrice ?? item?.comboPrice ?? item?.price);
  };

  const getItemStock = (item) => {
    return Math.max(0, getPositiveNumber(item?.stockQuantity ?? item?.stock));
  };

  const getComboRetailTotal = (combo) => {
    return (combo?.items || []).reduce((sum, comboItem) => {
      const productInfo = products.find(p => p.id === comboItem.productVariantId);
      const requiredQty = getPositiveNumber(comboItem.quantity || 1);
      return sum + getItemPrice(productInfo || comboItem) * requiredQty;
    }, 0);
  };

  const getComboSavings = (combo) => {
    return getComboRetailTotal(combo) - getPositiveNumber(combo?.comboPrice ?? combo?.price);
  };

  const getMaxApplicableComboCount = (cart, combo) => {
    const comboItems = combo?.items || [];
    if (comboItems.length === 0) return 0;

    let maxCount = Infinity;
    for (const comboItem of comboItems) {
      const requiredQty = getPositiveNumber(comboItem.quantity || 1);
      if (requiredQty <= 0) return 0;
      const cartItem = cart.find(c => !c.isCombo && c.id === comboItem.productVariantId);
      const cartQty = getPositiveNumber(cartItem?.qty || 0);
      maxCount = Math.min(maxCount, Math.floor(cartQty / requiredQty));
      if (maxCount <= 0) return 0;
    }

    return Number.isFinite(maxCount) ? maxCount : 0;
  };

  const autoApplyBestCombos = (cart) => {
    let workingCart = [...cart];

    while (true) {
      const applicableCombos = combos
        .filter(combo => !isInactiveItem(combo))
        .filter(combo => !validateSellableCombo(combo))
        .map(combo => ({
          combo,
          applicableCount: getMaxApplicableComboCount(workingCart, combo),
          savings: getComboSavings(combo)
        }))
        .filter(item => item.applicableCount > 0 && item.savings > 0)
        .sort((a, b) => {
          if (b.savings !== a.savings) return b.savings - a.savings;
          return getPositiveNumber(a.combo.id) - getPositiveNumber(b.combo.id);
        });

      if (applicableCombos.length === 0) break;

      const selectedCombo = applicableCombos[0].combo;

      for (const comboItem of selectedCombo.items || []) {
        const idx = workingCart.findIndex(c => !c.isCombo && c.id === comboItem.productVariantId);
        if (idx >= 0) {
          workingCart[idx].qty -= getPositiveNumber(comboItem.quantity || 1);
          if (workingCart[idx].qty <= 0) {
            workingCart.splice(idx, 1);
          }
        }
      }

      const comboCartId = `combo_${selectedCombo.id}`;
      const existingComboIdx = workingCart.findIndex(c => c.isCombo && c.id === comboCartId);
      if (existingComboIdx >= 0) {
        workingCart[existingComboIdx].qty += 1;
      } else {
        workingCart.push({
          id: comboCartId,
          name: `Combo: ${selectedCombo.comboName}`,
          price: getPositiveNumber(selectedCombo.comboPrice ?? selectedCombo.price),
          qty: 1,
          isCombo: true,
          comboId: selectedCombo.id,
          items: selectedCombo.items
        });
      }
    }

    return workingCart;
  };

  const validateSellableItem = (item, itemName = 'Sản phẩm này') => {
    if (isInactiveItem(item)) {
      return `${itemName} đã ngừng bán. Vui lòng chọn sản phẩm khác.`;
    }

    const price = getItemPrice(item);
    if (price <= 0) {
      return `${itemName} chưa thiết lập giá bán hoặc giá bằng 0đ, không thể bán.`;
    }

    const stock = getItemStock(item);
    if (stock <= 0) {
      return `${itemName} chưa nhập kho hoặc đã hết hàng, không thể bán.`;
    }

    return null;
  };

  const validateSellableCombo = (combo) => {
    const comboName = combo?.comboName ? `Combo ${combo.comboName}` : 'Combo này';

    if (isInactiveItem(combo)) {
      return `${comboName} đã ngừng bán. Vui lòng chọn sản phẩm khác.`;
    }

    const comboPrice = getPositiveNumber(combo?.comboPrice ?? combo?.price);
    if (comboPrice <= 0) {
      return `${comboName} chưa thiết lập giá bán hoặc giá bằng 0đ, không thể bán.`;
    }

    const comboItems = combo?.items || [];
    for (const comboItem of comboItems) {
      const productInfo = products.find(p => p.id === comboItem.productVariantId);
      const requiredQty = getPositiveNumber(comboItem.quantity || 1);
      const productName = productInfo?.name || 'Sản phẩm trong combo';

      if (!productInfo) {
        return `${comboName} có sản phẩm chưa nhập kho, không thể bán.`;
      }

      const itemError = validateSellableItem(productInfo, productName);
      if (itemError) return `${comboName} không thể bán vì ${itemError.toLowerCase()}`;

      if (getItemStock(productInfo) < requiredQty) {
        return `${comboName} không đủ tồn kho để bán.`;
      }
    }

    return null;
  };

  useEffect(() => {
    if (!showDiscontinuedModal) return;

    discontinuedConfirmButtonRef.current?.focus();

    const handleDiscontinuedModalEnter = (e) => {
      if (e.key === 'Enter') {
        const elapsed = Date.now() - discontinuedModalOpenedAtRef.current;
        if (elapsed < 150) return;
        e.preventDefault();
        discontinuedConfirmButtonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleDiscontinuedModalEnter);
    return () => window.removeEventListener('keydown', handleDiscontinuedModalEnter);
  }, [showDiscontinuedModal]);

  useEffect(() => {
    if (showDiscontinuedModal) return;
    if (searchInputRef.current && !showPaymentModal && !showInvoice && !showShortcuts) {
      searchInputRef.current.focus();
    }
  }, [showDiscontinuedModal, showPaymentModal, showInvoice, showShortcuts, activeOrderId]);

  const isInactiveStatus = (status) => {
    if (!status || typeof status !== 'string') return false;
    const normalized = status.toUpperCase();
    return ['INACTIVE', 'DISCONTINUED', 'STOP_SELLING', 'STOPPED', 'NGUNG_BAN'].includes(normalized);
  };

  const isInactiveItem = (item) => {
    return item?.isActive === false || item?.productActive === false || item?.active === false || isInactiveStatus(item?.status);
  };

  const addToCart = (product) => {
    const itemError = validateSellableItem(product, product?.name || 'Sản phẩm này');
    if (itemError) {
      showUnavailableWarning(itemError);
      return;
    }

    const existingItem = activeOrder.cart.find(item => item.id === product.id);

    if (existingItem && getItemStock(product) > 0 && existingItem.qty >= getItemStock(product)) {
      showUnavailableWarning(`${product?.name || 'Sản phẩm này'} không đủ tồn kho để thêm.`);
      return;
    }
    let nextCart;
    if (existingItem) {
      nextCart = activeOrder.cart.map(item =>
        item.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    } else {
      nextCart = [...activeOrder.cart, { ...product, qty: 1 }];
    }

    const autoComboCart = autoApplyBestCombos(nextCart);

    const updatedOrders = orders.map(order =>
      order.id === activeOrderId
        ? { ...order, cart: autoComboCart }
        : order
    );
    setOrders(updatedOrders);

    // Focus lại vào search input sau khi thêm sản phẩm
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);

    // Lưu ngay sau khi cập nhật
    setTimeout(() => {
      const currentOrder = updatedOrders.find(o => o.id === activeOrderId);
      if (currentOrder && currentOrder.cart.length > 0) {
        const subtotal = currentOrder.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const orderId = `ORDER_${activeOrderId}`;
        const pendingTransaction = {
          id: `#HD${Date.now().toString().slice(-6)}`,
          orderId: orderId,
          time: new Date().toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          quantity: `${currentOrder.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
          payment: "Tiền mặt",
          total: `${subtotal.toLocaleString()} đ`,
          status: "Chờ thanh toán",
          items: currentOrder.cart,
          customer: currentOrder.customer,
          customerMoney: 0,
          change: 0,
          pointsDiscount: 0,
          notes: ""
        };

        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const existingIndex = transactions.findIndex(t => t.orderId === orderId);

        if (existingIndex >= 0) {
          transactions[existingIndex] = pendingTransaction;
        } else {
          transactions.unshift(pendingTransaction);
        }
        localStorage.setItem('transactions', JSON.stringify(transactions));
      }
    }, 100);
  };

  const addComboToCart = (combo) => {
    const comboError = validateSellableCombo(combo);
    if (comboError) {
      showUnavailableWarning(comboError);
      return;
    }

    let currentCart = [...activeOrder.cart];

    const canConsumeFromCart = (combo.items || []).every(comboItem => {
      const cartItem = currentCart.find(c => !c.isCombo && c.id === comboItem.productVariantId);
      return getPositiveNumber(cartItem?.qty || 0) >= getPositiveNumber(comboItem.quantity || 1);
    });

    const existingComboIdx = currentCart.findIndex(c => c.isCombo && c.id === `combo_${combo.id}`);
    if (existingComboIdx >= 0) {
      const nextQty = currentCart[existingComboIdx].qty + 1;
      for (const comboItem of combo.items || []) {
        const productInfo = products.find(p => p.id === comboItem.productVariantId);
        const requiredQty = getPositiveNumber(comboItem.quantity || 1) * nextQty;
        if (getItemStock(productInfo) < requiredQty) {
          showUnavailableWarning(`Không đủ tồn kho để thêm ${combo?.comboName ? `Combo ${combo.comboName}` : 'combo này'}.`);
          return;
        }
      }
    }

    // Nếu giỏ đang có đủ thành phần combo thì trừ sản phẩm lẻ để gộp,
    // nếu chưa đủ thì vẫn cho thêm combo như user yêu cầu.
    if (canConsumeFromCart) {
      (combo.items || []).forEach(comboItem => {
        const existingIdx = currentCart.findIndex(c => !c.isCombo && c.id === comboItem.productVariantId);
        if (existingIdx >= 0) {
          currentCart[existingIdx].qty -= getPositiveNumber(comboItem.quantity || 1);
          if (currentCart[existingIdx].qty <= 0) {
            currentCart.splice(existingIdx, 1);
          }
        }
      });
    }

    let nextComboQty = 1;
    const existingComboIdxAfterConsume = currentCart.findIndex(c => c.isCombo && c.id === `combo_${combo.id}`);
    if (existingComboIdxAfterConsume >= 0) {
      nextComboQty = currentCart[existingComboIdxAfterConsume].qty + 1;
      currentCart[existingComboIdxAfterConsume].qty = nextComboQty;
    } else {
      currentCart.push({
        id: `combo_${combo.id}`,
        name: `Combo: ${combo.comboName}`,
        price: combo.comboPrice,
        qty: 1,
        isCombo: true,
        comboId: combo.id,
        items: combo.items
      });
    }

    if (nextComboQty > 0) {
      for (const comboItem of combo.items || []) {
        const productInfo = products.find(p => p.id === comboItem.productVariantId);
        const requiredQty = getPositiveNumber(comboItem.quantity || 1) * nextComboQty;
        if (getItemStock(productInfo) < requiredQty) {
          showUnavailableWarning(`Không đủ tồn kho để thêm ${combo?.comboName ? `Combo ${combo.comboName}` : 'combo này'}.`);
          return;
        }
      }
    }

    updateCart(currentCart);
  };

  const updateCart = (newCart) => {
    const cartAfterAutoApply = autoApplyBestCombos(newCart);
    const normalizedCart = [];

    for (const item of cartAfterAutoApply) {
      if (!item?.isCombo) {
        const productInfo = products.find(p => p.id === item.id) || item;
        const itemError = validateSellableItem(productInfo, productInfo?.name || item?.name || 'Sản phẩm này');
        if (itemError) {
          showUnavailableWarning(itemError);
          continue;
        }

        const maxStock = getItemStock(productInfo);
        const safeQty = Math.min(getPositiveNumber(item.qty || 0), maxStock);
        if (safeQty > 0) {
          normalizedCart.push({ ...item, qty: safeQty, price: getItemPrice(productInfo) });
        }
        continue;
      }

      const comboInfo = combos.find(c => c.id === item.comboId) || item;
      const comboError = validateSellableCombo(comboInfo);
      if (comboError) {
        showUnavailableWarning(comboError);
        continue;
      }

      const comboQty = getPositiveNumber(item.qty || 0);
      if (comboQty > 0) {
        normalizedCart.push({ ...item, qty: comboQty, price: getPositiveNumber(comboInfo.comboPrice ?? comboInfo.price) });
      }
    }

    const updatedOrders = orders.map(order =>
      order.id === activeOrderId ? { ...order, cart: normalizedCart } : order
    );
    setOrders(updatedOrders);

    // Lưu ngay sau khi cập nhật
    setTimeout(() => {
      const currentOrder = updatedOrders.find(o => o.id === activeOrderId);
      if (currentOrder && currentOrder.cart.length > 0) {
        const subtotal = currentOrder.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const orderId = `ORDER_${activeOrderId}`;
        const pendingTransaction = {
          id: `#HD${Date.now().toString().slice(-6)}`,
          orderId: orderId,
          time: new Date().toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          quantity: `${currentOrder.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
          payment: "Tiền mặt",
          total: `${subtotal.toLocaleString()} đ`,
          status: "Chờ thanh toán",
          items: currentOrder.cart,
          customer: currentOrder.customer,
          customerMoney: 0,
          change: 0,
          pointsDiscount: 0,
          notes: ""
        };

        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const existingIndex = transactions.findIndex(t => t.orderId === orderId);

        if (existingIndex >= 0) {
          transactions[existingIndex] = pendingTransaction;
        } else {
          transactions.unshift(pendingTransaction);
        }
        localStorage.setItem('transactions', JSON.stringify(transactions));
      } else {
        // Xóa đơn treo nếu giỏ hàng trống
        const orderId = `ORDER_${activeOrderId}`;
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const filteredTransactions = transactions.filter(t => t.orderId !== orderId);
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
      }
    }, 100);
  };

  const updateCustomer = (customer) => {
    // Luôn giữ lại spentAmount nếu có khi update khách
    setOrders(orders.map(order =>
      order.id === activeOrderId ? { ...order, customer: { ...customer, spentAmount: customer?.spentAmount || 0 } } : order
    ));
  };



  const updateUsePoints = (usePoints) => {
    setOrders(orders.map(order =>
      order.id === activeOrderId ? { ...order, usePoints } : order
    ));
  };

  const addNewOrder = () => {
    const newId = Math.max(...orders.map(o => o.id)) + 1;
    const newOrders = [...orders, { id: newId, cart: [], customer: null, usePoints: false }].sort((a, b) => a.id - b.id);
    setOrders(newOrders);
    setActiveOrderId(newId);
  };

  const deleteOrder = (orderId) => {
    if (orders.length > 1) {
      const newOrders = orders.filter(order => order.id !== orderId).sort((a, b) => a.id - b.id);
      setOrders(newOrders);
      if (activeOrderId === orderId) {
        setActiveOrderId(newOrders[0].id);
      }
    }
  };

  const redeemVoucherUsageIfNeeded = async (voucherId) => {
    if (!voucherId) return;
    try {
      await eventService.redeemVoucher(voucherId);
    } catch (error) {
      console.error('Error redeeming voucher usage:', error);
    }
  };

  const completeOrder = async (orderData) => {
    // Xóa đơn chờ thanh toán
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filteredTransactions = transactions.filter(t => t.status !== "Chờ thanh toán");

    // Đã xóa đồng bộ điểm khách hàng qua localStorage, chỉ sử dụng database qua PaymentModal

    const transaction = {
      id: `#HD${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      quantity: `${orderData.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
      payment: orderData.paymentMethod || "Tiền mặt",
      total: `${orderData.total.toLocaleString()} đ`,
      status: "Hoàn thành",
      cart: orderData.cart.map(item => ({
        ...item,
        productId: item.id
      })),
      items: orderData.cart,
      customer: orderData.customer,
      customerMoney: orderData.customerMoney,
      change: orderData.change,
      pointsDiscount: orderData.pointsDiscount,
      discount: orderData.discount || 0,
      notes: orderData.notes
    };

    filteredTransactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(filteredTransactions));

    // Lưu ngay vào database
    if (transaction.cart && transaction.cart.length > 0) {
      try {
        const validItemsMap = new Map();

        transaction.cart.forEach(item => {
          if (item?.isCombo) {
            const comboQty = Number(item.qty || item.quantity || 1);
            if (!Number.isFinite(comboQty) || comboQty <= 0) return;

            (item.items || []).forEach(comboItem => {
              const productId = Number(comboItem?.productVariantId || comboItem?.productId || comboItem?.id);
              const comboItemQty = Number(comboItem?.quantity || 0);
              if (!Number.isInteger(productId) || productId <= 0 || !Number.isFinite(comboItemQty) || comboItemQty <= 0) {
                return;
              }

              const quantity = comboQty * comboItemQty;
              const price = Number(comboItem?.price || 0);
              const subtotal = price * quantity;

              const existing = validItemsMap.get(productId);
              if (existing) {
                existing.quantity += quantity;
                existing.subtotal = existing.price * existing.quantity;
                return;
              }

              validItemsMap.set(productId, {
                productId,
                productName: comboItem?.productName || comboItem?.name || item.name || item.productName || '',
                quantity,
                price,
                subtotal
              });
            });
            return;
          }

          const productId = Number(item.productId || item.id);
          if (!Number.isInteger(productId) || productId <= 0) return;

          const quantity = Number(item.qty || item.quantity || 1);
          const price = Number(item.price || 0);
          const subtotal = price * quantity;

          const existing = validItemsMap.get(productId);
          if (existing) {
            existing.quantity += quantity;
            existing.subtotal = existing.price * existing.quantity;
            return;
          }

          validItemsMap.set(productId, {
            productId,
            productName: item.name || item.productName || '',
            quantity,
            price,
            subtotal
          });
        });

        const validItems = Array.from(validItemsMap.values()).filter(item =>
          Number.isInteger(item.productId) && item.productId > 0 &&
          Number.isFinite(item.quantity) && item.quantity > 0 &&
          Number.isFinite(item.price) && item.price >= 0 &&
          Number.isFinite(item.subtotal) && item.subtotal >= 0
        );

        if (validItems.length > 0) {
          const request = {
            customerId: transaction.customer?.id || 0,
            customerName: transaction.customer?.name || "Khách lẻ",
            paymentMethod: transaction.payment,
            items: validItems
          };
          await api.post('/pos/purchase-history', request);
        }
        await redeemVoucherUsageIfNeeded(orderData.selectedVoucherId);

        // Đồng bộ lại danh sách sản phẩm để cập nhật tồn kho
        loadProducts();
      } catch (error) {
        console.error('Error saving purchase history:', error);
      }
    }

    setShowPaymentModal(false);
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
      setShowInvoice(false);
    }, 5000);

    setSelectedTransaction(transaction);
    setShowInvoice(true);

    if (orders.length > 1) {
      const newOrders = orders.filter(order => order.id !== activeOrderId).sort((a, b) => a.id - b.id);
      setOrders(newOrders);
      setActiveOrderId(newOrders[0].id);
    } else {
      const newId = activeOrderId + 1;
      setOrders([{ id: newId, cart: [], customer: null, usePoints: false }]);
      setActiveOrderId(newId);
    }
  };

  const handleStartQRPayment = (orderData, amount, paymentCode) => {
    const orderId = `ORDER_${activeOrderId}`;
    const orderDataWithOrderId = { ...orderData, orderId };

    setPendingQROrders(prev => [...prev, {
      id: Date.now(),
      paymentCode,
      amount,
      orderData: orderDataWithOrderId
    }]);

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const pendingQRTransaction = {
      id: `#HD${Date.now().toString().slice(-6)}`,
      orderId,
      time: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      quantity: `${orderData.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
      payment: "Chuyển khoản",
      total: `${orderData.total.toLocaleString()} đ`,
      status: "Chờ thanh toán",
      items: orderData.cart,
      customer: orderData.customer,
      customerMoney: 0,
      change: 0,
      pointsDiscount: orderData.pointsDiscount || 0,
      notes: orderData.notes || ""
    };

    const existingIndex = transactions.findIndex(t => t.orderId === orderId);
    if (existingIndex >= 0) {
      transactions[existingIndex] = {
        ...transactions[existingIndex],
        ...pendingQRTransaction,
      };
    } else {
      transactions.unshift(pendingQRTransaction);
    }
    localStorage.setItem('transactions', JSON.stringify(transactions));

    if (orders.length > 1) {
      const newOrders = orders.filter(order => order.id !== activeOrderId).sort((a, b) => a.id - b.id);
      setOrders(newOrders);
      setActiveOrderId(newOrders[0].id);
    } else {
      const newId = activeOrderId + 1;
      setOrders([{ id: newId, cart: [], customer: null, usePoints: false }]);
      setActiveOrderId(newId);
    }
    setShowPaymentModal(false);
  };

  const handleCompleteQRPayment = async (id, orderData) => {
    const transaction = {
      id: `#HD${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
      }),
      quantity: `${orderData.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
      payment: "Chuyển khoản",
      total: `${orderData.total.toLocaleString()} đ`,
      status: "Hoàn thành",
      cart: orderData.cart.map(item => ({ ...item, productId: item.id })),
      items: orderData.cart,
      customer: orderData.customer,
      customerMoney: orderData.customerMoney,
      change: orderData.change,
      pointsDiscount: orderData.pointsDiscount,
      discount: orderData.discount || 0,
      notes: orderData.notes
    };

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filteredTransactions = orderData.orderId
      ? transactions.filter(t => t.orderId !== orderData.orderId)
      : transactions;

    filteredTransactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(filteredTransactions));

    if (transaction.cart && transaction.cart.length > 0) {
      try {
        if (transaction.customer && transaction.customer.id) {
          await api.put(`/crm/customers/${transaction.customer.id}`, {
            name: transaction.customer.name,
            phone: transaction.customer.phone,
            loyaltyPoints: transaction.customer.loyaltyPoints,
            spentAmount: transaction.customer.spentAmount,
          });
        }

        const validItemsMap = new Map();

        transaction.cart.forEach(item => {
          if (item?.isCombo) {
            const comboQty = Number(item.qty || item.quantity || 1);
            if (!Number.isFinite(comboQty) || comboQty <= 0) return;

            (item.items || []).forEach(comboItem => {
              const productId = Number(comboItem?.productVariantId || comboItem?.productId || comboItem?.id);
              const comboItemQty = Number(comboItem?.quantity || 0);
              if (!Number.isInteger(productId) || productId <= 0 || !Number.isFinite(comboItemQty) || comboItemQty <= 0) {
                return;
              }

              const quantity = comboQty * comboItemQty;
              const price = Number(comboItem?.price || 0);
              const subtotal = price * quantity;

              const existing = validItemsMap.get(productId);
              if (existing) {
                existing.quantity += quantity;
                existing.subtotal = existing.price * existing.quantity;
                return;
              }

              validItemsMap.set(productId, {
                productId,
                productName: comboItem?.productName || comboItem?.name || item.name || item.productName || '',
                quantity,
                price,
                subtotal
              });
            });
            return;
          }

          const productId = Number(item.productId || item.id);
          if (!Number.isInteger(productId) || productId <= 0) return;

          const quantity = Number(item.qty || item.quantity || 1);
          const price = Number(item.price || 0);
          const subtotal = price * quantity;

          const existing = validItemsMap.get(productId);
          if (existing) {
            existing.quantity += quantity;
            existing.subtotal = existing.price * existing.quantity;
            return;
          }

          validItemsMap.set(productId, {
            productId,
            productName: item.name || item.productName || '',
            quantity,
            price,
            subtotal
          });
        });

        const validItems = Array.from(validItemsMap.values()).filter(item =>
          Number.isInteger(item.productId) && item.productId > 0 &&
          Number.isFinite(item.quantity) && item.quantity > 0 &&
          Number.isFinite(item.price) && item.price >= 0 &&
          Number.isFinite(item.subtotal) && item.subtotal >= 0
        );

        if (validItems.length > 0) {
          const request = {
            customerId: transaction.customer?.id || 0,
            customerName: transaction.customer?.name || "Khách lẻ",
            paymentMethod: transaction.payment,
            items: validItems
          };
          await api.post('/pos/purchase-history', request);
        }
        await redeemVoucherUsageIfNeeded(orderData.selectedVoucherId);
        loadProducts();
      } catch (error) {
        console.error('Error saving purchase history:', error);
      }
    }

    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
      setShowInvoice(false);
    }, 5000);
    setSelectedTransaction(transaction);
    setShowInvoice(true);

    setPendingQROrders(prev => prev.filter(o => o.id !== id));
  };

  const handleCancelQRPayment = (id) => {
    setPendingQROrders(prev => prev.filter(o => o.id !== id));
  };

  const handlePrintCurrentInvoice = () => {
    const currentOrder = activeOrder;
    if (currentOrder.cart.length === 0) {
      const emptyTransaction = {
        id: `#HD${Date.now().toString().slice(-6)}`,
        time: new Date().toLocaleString('vi-VN'),
        quantity: `0 món`,
        payment: "Chưa thanh toán",
        total: `0 đ`,
        status: "Không có sản phẩm",
        cart: [],
        items: [],
        customer: null,
        customerMoney: 0,
        change: 0,
        pointsDiscount: 0,
        discount: 0,
        notes: ""
      };
      setSelectedTransaction(emptyTransaction);
      setShowInvoice(true);
      return;
    }

    const subtotal = currentOrder.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const pendingTransaction = {
      id: `#HD${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString('vi-VN'),
      quantity: `${currentOrder.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
      payment: "Chưa thanh toán",
      total: `${subtotal.toLocaleString()} đ`,
      status: "Chờ thanh toán",
      cart: currentOrder.cart,
      items: currentOrder.cart,
      customer: currentOrder.customer,
      customerMoney: 0,
      change: 0,
      pointsDiscount: 0,
      discount: 0,
      notes: ""
    };
    setSelectedTransaction(pendingTransaction);
    setShowInvoice(true);
  };

  return (
    <div style={{
      height: "89vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#f8f9fa",
      overflow: "hidden",
      paddingTop: "20px",
    }}>
      <div style={{ padding: "10px 20px" }}>
        <TopBar
          searchInputRef={searchInputRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          addToCart={addToCart}
          addNewOrder={addNewOrder}
          orders={orders}
          activeOrderId={activeOrderId}
          setActiveOrderId={setActiveOrderId}
          deleteOrder={deleteOrder}
          onPrintInvoice={handlePrintCurrentInvoice}
          onOpenLoyalty={() => navigate('/crm/loyalty')}
          onKeyDown={handleKeyDown}
          selectedProductIndex={selectedProductIndex}
          setShowShortcuts={setShowShortcuts}
          notifications={notifications}
        />
      </div>

      {showShortcuts && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
              Cài đặt Phím tắt hệ thống
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>In hóa đơn hiện tại</span>
                <input
                  value={shortcuts.printInvoice}
                  onChange={(e) => setShortcuts({ ...shortcuts, printInvoice: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Thanh toán</span>
                <input
                  value={shortcuts.payment1}
                  onChange={(e) => setShortcuts({ ...shortcuts, payment1: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Trỏ xuống gợi ý Combo</span>
                <input
                  value={shortcuts.comboFocus}
                  onChange={(e) => setShortcuts({ ...shortcuts, comboFocus: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Thêm hóa đơn mới</span>
                <input
                  value={shortcuts.newOrder}
                  onChange={(e) => setShortcuts({ ...shortcuts, newOrder: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Mở trang Đổi quà</span>
                <input
                  value={shortcuts.loyaltyPage}
                  onChange={(e) => setShortcuts({ ...shortcuts, loyaltyPage: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Đóng popup thanh toán (nút X)</span>
                <input
                  value={shortcuts.closePaymentModal}
                  onChange={(e) => setShortcuts({ ...shortcuts, closePaymentModal: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Xóa SP cuối trong giỏ</span>
                <input
                  value={shortcuts.deleteCartItem}
                  onChange={(e) => setShortcuts({ ...shortcuts, deleteCartItem: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Xóa hóa đơn đang chọn</span>
                <input
                  value={shortcuts.deleteOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    const finalVal = val.toLowerCase() === 'delete' ? 'Delete' : val.toUpperCase();
                    setShortcuts({ ...shortcuts, deleteOrder: finalVal });
                  }}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", color: "#666", fontSize: "13px" }}>
                <span>Chuyển hóa đơn tiếp theo</span>
                <strong>Tab</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "13px" }}>
                <span>Chuyển hóa đơn trước đó</span>
                <strong>Shift + Tab</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "13px" }}>
                <span>Tăng giảm số lượng SP</span>
                <strong>+, -</strong>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('posShortcuts', JSON.stringify(shortcuts));
                setShowShortcuts(false);
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                marginTop: "20px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Lưu & Đóng
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{ marginTop: "20px" }}>
          <PaymentModal
            cart={activeOrder.cart}
            customer={activeOrder.customer}
            onClose={() => setShowPaymentModal(false)}
            onComplete={completeOrder}
            onStartQRPayment={handleStartQRPayment}
            shortcuts={shortcuts}
          />
        </div>
      )}

      {showInvoice && (
        <Invoice
          transaction={selectedTransaction}
          shortcuts={shortcuts}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {showSuccessNotification && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#007bff",
          color: "white",
          padding: "15px 25px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px",
          fontWeight: "500",
          animation: "slideIn 0.3s ease-out",
          overflow: "hidden"
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(400px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes successBorderProgress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
          <span style={{ fontSize: "20px" }}>✓</span>
          <span>Thanh toán thành công!</span>
          <div style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: "3px",
            background: "rgba(255,255,255,0.95)",
            animation: "successBorderProgress 5s linear forwards"
          }} />
        </div>
      )}

      {showDiscontinuedModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "10px",
            width: "380px",
            maxWidth: "90%",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#dc3545", fontSize: "18px" }}>
              Thông báo
            </h3>
            <p style={{ margin: 0, color: "#333", fontSize: "14px", lineHeight: "1.5" }}>
              {discontinuedMessage}
            </p>
            <button
              ref={discontinuedConfirmButtonRef}
              autoFocus
              onClick={closeDiscontinuedModal}
              style={{
                marginTop: "18px",
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                background: "#007bff",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",
          color: "#666"
        }}>
          Đang tải sản phẩm...
        </div>
      ) : (
        <div style={{
          flex: 1,
          padding: "0 20px 10px 20px",
          overflow: "hidden",
          display: "flex",
          paddingTop: "30px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            width: "100%",
            paddingTop: "0px",
            minHeight: 0
          }}>
            <Cart
              cart={activeOrder.cart}
              setCart={updateCart}
              combos={combos}
              products={products}
              addToCart={addToCart}
              addComboToCart={addComboToCart}
            />
            <PaymentPanel
              cart={activeOrder.cart}
              customer={activeOrder.customer}
              usePoints={activeOrder.usePoints}
              onOpenPayment={() => setShowPaymentModal(true)}
            />
          </div>
        </div>
      )}

      {/* Cửa sổ QR Pending Widget */}
      <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1005,
      }}>
        {pendingQROrders.map((po) => (
           <QRPendingWidget
             key={po.id}
             pendingOrder={po}
             onComplete={handleCompleteQRPayment}
             onCancel={handleCancelQRPayment}
           />
        ))}
      </div>
    </div>
  );
}
