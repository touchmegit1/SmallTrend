import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useActiveCampaigns, useAllVariants } from '../../hooks/useEventData';
import SideAds from './Component/SideAds';
import loyaltyService from '../../services/loyaltyService';

// ─── PLACEHOLDER IMAGE ────────────────────────────────────────────────────────
const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";

// ─── DISCOUNT BADGE helper ────────────────────────────────────────────────────
function DiscountBadge({ couponType, discountPercent, discountAmount }) {
  if (couponType === "PERCENTAGE" && discountPercent)
    return (
      <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 text-xs rounded font-bold shadow">
        -{discountPercent}% OFF
      </span>
    );
  if (couponType === "FIXED_AMOUNT" && discountAmount)
    return (
      <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-0.5 text-xs rounded font-bold shadow">
        -{Number(discountAmount).toLocaleString("vi-VN")}đ
      </span>
    );
  return null;
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const fmt = (v) => (v != null ? Number(v).toLocaleString("vi-VN") + "đ" : "-");

function ProductCard({ v, highlight = false }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${highlight ? "ring-2 ring-red-400" : ""
        }`}
    >
      <div className="relative">
        <img
          src={v.imageUrl || PLACEHOLDER}
          className="h-48 w-full object-cover"
          alt={v.name}
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        <DiscountBadge
          couponType={v.couponType}
          discountPercent={v.discountPercent}
          discountAmount={v.discountAmount}
        />
        {v.couponCode && (
          <span className="absolute top-2 right-2 bg-purple-700 text-white px-1.5 py-0.5 text-xs rounded font-mono shadow">
            {v.couponCode}
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-0.5">
            {v.name}
          </h3>
          {v.sku && (
            <p className="text-xs text-gray-400 font-mono mb-1">{v.sku}</p>
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
          <span className="text-base font-bold text-gray-900">
            {fmt(v.discountedPrice ?? v.sellPrice)}
          </span>
          {v.discountedPrice != null && (
            <span className="text-xs text-gray-400 line-through">
              {fmt(v.sellPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GIFT CARD ────────────────────────────────────────────────────────────────
function GiftCard({ g, highlight = false }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${highlight ? "ring-2 ring-emerald-400" : ""
        }`}
    >
      <div className="relative">
        <img
          src={g.image || PLACEHOLDER}
          className="h-48 w-full object-cover"
          alt={g.name}
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        <span className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 text-xs rounded font-bold shadow">
          {g.requiredPoints?.toLocaleString()} điểm
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-0.5">
            {g.name}
          </h3>
          <p className="text-xs text-gray-400 font-mono mb-1">
            Số lượng còn: {g.stock}
          </p>
        </div>
        <div className="mt-2">
          {g.description && <p className="text-xs text-gray-500 line-clamp-2">{g.description}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PAGE_SIZE = 4; // Số sp hiển thị mỗi "trang" trong slider

export default function EcommerceUI() {
  const { campaigns: activeCampaigns, loading: loadingCampaign } = useActiveCampaigns();
  const activeCampaign = activeCampaigns.length > 0 ? activeCampaigns[0] : null;
  const { variants: allVariants, loading: loadingAll } = useAllVariants();
  const loadingProducts = loadingAll;

  // Best Sellers từ POS
  const [bestsellers, setBestsellers] = useState([]);
  useEffect(() => {
    try {
      const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const completedTransactions = savedTransactions.filter(t => t.status !== "Chờ thanh toán");
      const productStats = {};
      completedTransactions.forEach(t => {
        if (t.items) {
          t.items.forEach(item => {
            const productCode = item.sku || item.barcode || item.code || 'N/A';
            const qty = item.quantity || item.qty || 1;
            if (!productStats[item.name]) {
              productStats[item.name] = {
                name: item.name,
                sku: productCode,
                sellPrice: item.price,
                quantity: 0,
                imageUrl: item.image || item.imageUrl || ""
              };
            }
            productStats[item.name].quantity += qty;
          });
        }
      });
      const topProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
      setBestsellers(topProducts);
    } catch (e) { }
  }, []);

  // Slider state (Best Sellers)
  const [sliderPage, setSliderPage] = useState(0);

  // ── Gifts Data ────────────────────────────────────────────────────────────
  const [gifts, setGifts] = useState([]);
  const [giftsLoading, setGiftsLoading] = useState(true);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const giftData = await loyaltyService.getAllGifts();
        // Chỉ lấy những quà tặng còn active và có sắn
        const activeGifts = giftData.filter(g => g.isActive && g.stock > 0);
        setGifts(activeGifts);
      } catch (err) {
        console.error("Lỗi khi tải quà tặng", err);
      } finally {
        setGiftsLoading(false);
      }
    };
    fetchGifts();
  }, []);

  // Slider state (Gifts)
  const [giftSliderPage, setGiftSliderPage] = useState(0);
  const totalGiftPages = Math.ceil(gifts.length / PAGE_SIZE);
  const visibleGifts = gifts.slice(
    giftSliderPage * PAGE_SIZE,
    giftSliderPage * PAGE_SIZE + PAGE_SIZE
  );
  const prevGiftSlide = () => setGiftSliderPage((p) => Math.max(0, p - 1));
  const nextGiftSlide = () => setGiftSliderPage((p) => Math.min(totalGiftPages - 1, p + 1));

  // ── Modal "View All" state ────────────────────────────────────────────────
  const [showViewAll, setShowViewAll] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  // ── All Products Filter & Pagination ──────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [allPage, setAllPage] = useState(1);
  const ALL_PAGE_SIZE = 8;

  const categories = ["Tất cả", ...new Set(allVariants.map(v => v.categoryName || v.category || "Chưa phân loại").filter(Boolean))];
  const filteredAllVariants = allVariants.filter(v => selectedCategory === "Tất cả" || (v.categoryName === selectedCategory || v.category === selectedCategory || (!v.categoryName && !v.category && selectedCategory === "Chưa phân loại")));
  const totalAllPages = Math.ceil(filteredAllVariants.length / ALL_PAGE_SIZE);
  const allVisibleItems = filteredAllVariants.slice((allPage - 1) * ALL_PAGE_SIZE, allPage * ALL_PAGE_SIZE);

  // ── Slider logic ──────────────────────────────────────────────────────────
  const totalPages = Math.ceil(bestsellers.length / PAGE_SIZE);
  const visibleItems = bestsellers.slice(
    sliderPage * PAGE_SIZE,
    sliderPage * PAGE_SIZE + PAGE_SIZE
  );

  const prevSlide = () => setSliderPage((p) => Math.max(0, p - 1));
  const nextSlide = () => setSliderPage((p) => Math.min(totalPages - 1, p + 1));

  // ── Modal search filter ───────────────────────────────────────────────────
  const modalItems = bestsellers.filter((v) => {
    const kw = modalSearch.toLowerCase().trim();
    return !kw || v.name?.toLowerCase().includes(kw) || v.sku?.toLowerCase().includes(kw);
  });


  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── SIDE ADVERTISEMENTS ── */}
      <SideAds />

      {/* ── NAVBAR ── */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">SmallTrend</h1>
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Login
            </a>
          </div>
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {activeCampaign ? (
          <div
            className="relative rounded-2xl text-white py-14 text-center overflow-hidden"
            style={{
              background: activeCampaign.bannerImageUrl
                ? `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.52)), url('${activeCampaign.bannerImageUrl}') center/cover no-repeat`
                : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            }}
          >
            <span className="inline-block bg-red-500 px-4 py-1 text-sm rounded-full mb-3 font-semibold">
              {activeCampaign.campaignType || "SALE"} · Đang diễn ra
            </span>
            <h1 className="text-4xl font-bold mt-2">{activeCampaign.campaignName}</h1>
            {activeCampaign.description && (
              <p className="mt-2 text-lg opacity-90 max-w-xl mx-auto">
                {activeCampaign.description}
              </p>
            )}
            {activeCampaign.endDate && (
              <p className="mt-3 text-sm opacity-75">
                Kết thúc: {activeCampaign.endDate}
              </p>
            )}
          </div>
        ) : (
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-900 to-blue-600 text-white py-12 text-center">
            <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 text-sm rounded-full">
              Limited Time Offer
            </span>
            <h1 className="text-4xl font-bold mt-6">SmallTrend Store</h1>
            <p className="mt-2 text-lg opacity-90">Khám phá các ưu đãi hấp dẫn</p>
          </div>
        )}
      </div>

      {/* ── BEST SELLERS – slider ── */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Best Sellers</h2>
          {bestsellers.length > 0 && (
            <button
              onClick={() => { setShowViewAll(true); setModalSearch(""); }}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View All →
            </button>
          )}
        </div>

        {bestsellers.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Chưa có sản phẩm bán chạy.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleItems.map((v) => (
                <ProductCard key={v.sku} v={v} highlight />
              ))}
            </div>

            {/* Arrow Prev */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={sliderPage === 0}
                  className={`absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${sliderPage === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-blue-600 hover:text-white text-gray-700"
                    }`}
                >
                  ‹
                </button>
                {/* Arrow Next */}
                <button
                  onClick={nextSlide}
                  disabled={sliderPage >= totalPages - 1}
                  className={`absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${sliderPage >= totalPages - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-blue-600 hover:text-white text-gray-700"
                    }`}
                >
                  ›
                </button>
              </>
            )}

            {/* Dot indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSliderPage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === sliderPage ? "bg-blue-600 w-5" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── GIFTS PROMOTION – slider ── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Đổi Quà Khách Hàng</h2>
        </div>

        {giftsLoading ? (
          <div className="text-center py-10 text-gray-400">Đang tải quà tặng...</div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">Hiện chưa có phần quà nào cho phép đổi.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleGifts.map((g) => (
                <GiftCard key={g.id} g={g} highlight />
              ))}
            </div>

            {/* Arrow Prev */}
            {totalGiftPages > 1 && (
              <>
                <button
                  onClick={prevGiftSlide}
                  disabled={giftSliderPage === 0}
                  className={`absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${giftSliderPage === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-emerald-600 hover:text-white text-gray-700"
                    }`}
                >
                  ‹
                </button>
                {/* Arrow Next */}
                <button
                  onClick={nextGiftSlide}
                  disabled={giftSliderPage >= totalGiftPages - 1}
                  className={`absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${giftSliderPage >= totalGiftPages - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-emerald-600 hover:text-white text-gray-700"
                    }`}
                >
                  ›
                </button>
              </>
            )}

            {/* Dot indicators */}
            {totalGiftPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-5">
                {Array.from({ length: totalGiftPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGiftSliderPage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === giftSliderPage ? "bg-emerald-500 w-5" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ALL PRODUCTS ── */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pb-12">
        <h2 className="text-2xl font-semibold mb-6">Tất cả Sản phẩm</h2>

        {loadingProducts ? (
          <div className="text-center py-12 text-gray-400">
            Đang tải sản phẩm...
          </div>
        ) : allVariants.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mt-2">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <div>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedCategory(cat); setAllPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredAllVariants.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Không tìm thấy sản phẩm trong mục này.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {allVisibleItems.map((v) => (
                  <ProductCard key={v.sku} v={v} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalAllPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setAllPage(p => Math.max(1, p - 1))}
                  disabled={allPage === 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors font-bold text-lg ${allPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white shadow text-gray-600 hover:bg-blue-50"}`}
                >
                  ‹
                </button>
                <div className="text-sm text-gray-500 font-medium">Trang {allPage} / {totalAllPages}</div>
                <button
                  onClick={() => setAllPage(p => Math.min(totalAllPages, p + 1))}
                  disabled={allPage >= totalAllPages}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors font-bold text-lg ${allPage >= totalAllPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white shadow text-gray-600 hover:bg-blue-50"}`}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: VIEW ALL BEST SELLERS ── */}
      {showViewAll && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowViewAll(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800">🔥 Best Sellers</h2>
                <p className="text-sm text-gray-500">
                  {bestsellers.length} sản phẩm bán chạy nhất
                </p>
              </div>
              <button
                onClick={() => setShowViewAll(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b flex-shrink-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 p-6">
              {modalItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  Không tìm thấy sản phẩm.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {modalItems.map((v) => (
                    <ProductCard key={v.sku} v={v} highlight />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
