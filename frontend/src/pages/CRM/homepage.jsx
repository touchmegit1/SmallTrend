import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import { useActiveCampaigns, useDiscountedVariants, useAllVariants } from '../../hooks/useEventData';
import { resolveImageUrl } from '../../utils/inventory';
import { useVouchers } from '../../hooks/useVouchers';
import { useGifts } from '../../hooks/useGifts';
import { useProductCombos } from '../../hooks/product_combos';
import { useFetchCategories } from '../../hooks/categories';
import adService from '../../services/adService';

const PLACEHOLDER = "https://placehold.co/640x480?text=SmallTrend";
const COMBO_PLACEHOLDER = "https://placehold.co/640x480?text=Combo";
const PAGE_SIZE = 3;

const fmt = (value) => (value != null ? `${Number(value).toLocaleString("vi-VN")}đ` : "-");

const getProductName = (variant) => variant?.name || variant?.productName || variant?.sku || "Sản phẩm";

const getCategoryName = (variant) =>
  variant?.categoryName || variant?.category_name || variant?.category?.name || "";

const getCategoryId = (variant) =>
  variant?.categoryId ?? variant?.category_id ?? variant?.category?.id;

const getSearchText = (variant) => [
  variant?.name,
  variant?.productName,
  variant?.sku,
  variant?.brandName,
  getCategoryName(variant),
].filter(Boolean).join(" ").toLowerCase();

const getSaving = (variant) => {
  const originalPrice = Number(variant?.sellPrice ?? 0);
  const finalPrice = Number(variant?.discountedPrice ?? variant?.sellPrice ?? 0);
  return Math.max(0, originalPrice - finalPrice);
};

const isVoucherCurrentlyActive = (voucher) => {
  const rawStatus = (voucher?.status || "").toUpperCase();
  if (rawStatus !== "ACTIVE") return false;

  if (!voucher?.endDate) return true;
  const endDate = new Date(voucher.endDate);
  if (Number.isNaN(endDate.getTime())) return true;

  // Keep voucher active until the end of its endDate in local time.
  endDate.setHours(23, 59, 59, 999);
  return endDate >= new Date();
};

const formatVoucherBenefit = (voucher) => {
  if (voucher?.couponType === "PERCENTAGE") {
    return `Giảm ${voucher?.discountPercent || 0}%`;
  }
  if (voucher?.couponType === "FIXED_AMOUNT") {
    return `Giảm ${fmt(voucher?.discountAmount)}`;
  }
  return voucher?.couponName || "Ưu đãi tại quầy";
};

function DiscountBadge({ couponType, discountPercent, discountAmount }) {
  if (couponType === "PERCENTAGE" && discountPercent) {
    return (
      <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow">
        Giảm {discountPercent}%
      </span>
    );
  }

  if (couponType === "FIXED_AMOUNT" && discountAmount) {
    return (
      <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow">
        Giảm {fmt(discountAmount)}
      </span>
    );
  }

  return null;
}

function ProductCard({ v, compact = false, highlight = false }) {
  const productName = getProductName(v);
  const currentPrice = v?.discountedPrice ?? v?.sellPrice;

  return (
    <div className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${highlight ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"}`}>
      <div className="relative">
        <img
          src={v?.imageUrl || PLACEHOLDER}
          className={`${compact ? "h-44" : "h-56"} w-full object-cover`}
          alt={productName}
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        <DiscountBadge
          couponType={v?.couponType}
          discountPercent={v?.discountPercent}
          discountAmount={v?.discountAmount}
        />
        {v?.couponCode && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow">
            {v.couponCode}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="mb-1 flex flex-wrap gap-2 text-xs text-slate-500">
            {v?.brandName && <span>{v.brandName}</span>}
            {getCategoryName(v) && <span>• {getCategoryName(v)}</span>}
          </div>
          <h3 className={`font-semibold text-slate-900 ${compact ? "text-base" : "text-lg"}`}>
            {productName}
          </h3>
          {v?.sku && <p className="mt-1 text-xs font-mono text-slate-400">SKU: {v.sku}</p>}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-950">{fmt(currentPrice)}</span>
          {v?.discountedPrice != null && (
            <span className="pb-0.5 text-sm text-slate-400 line-through">{fmt(v.sellPrice)}</span>
          )}
        </div>

      </div>
    </div>
  );
}

function GiftCard({ gift }) {
  const giftName = gift?.name || "Quà loyalty";
  const requiredPoints = Number(gift?.requiredPoints || 0);
  const stock = Number(gift?.stock || 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={gift?.image || "https://placehold.co/640x480?text=Gift"}
          className="h-56 w-full object-cover"
          alt={giftName}
          onError={(e) => {
            e.target.src = "https://placehold.co/640x480?text=Gift";
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
          {requiredPoints.toLocaleString("vi-VN")} pts
        </span>
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow ${stock > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {stock > 0 ? `Còn ${stock}` : "Hết quà"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{giftName}</h3>
          {gift?.sku && <p className="mt-1 text-xs font-mono text-slate-400">SKU: {gift.sku}</p>}
        </div>

        <p className="text-sm font-medium text-slate-700">Đổi ngay tại quầy với điểm tích lũy</p>
      </div>
    </div>
  );
}

const getComboImage = (combo) => {
  if (!combo?.imageUrl) return COMBO_PLACEHOLDER;
  if (combo.imageUrl.startsWith("http")) return combo.imageUrl;
  return `${import.meta.env.PROD ? "" : "http://localhost:8081"}${combo.imageUrl.startsWith("/") ? "" : "/"}${combo.imageUrl}`;
};

function ComboCard({ combo }) {
  const originalPrice = Number(combo?.originalPrice || 0);
  const comboPrice = Number(combo?.comboPrice || 0);
  const discountPercent = originalPrice > 0
    ? Math.max(0, Math.round((1 - (comboPrice / originalPrice)) * 100))
    : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={getComboImage(combo)}
          className="h-56 w-full object-cover"
          alt={combo?.comboName || "Combo ưu đãi"}
          onError={(e) => {
            e.target.src = COMBO_PLACEHOLDER;
          }}
        />
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Giảm {discountPercent}%
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{combo?.comboName || "Combo"}</h3>
          {combo?.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{combo.description}</p>
          )}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-slate-950">{fmt(comboPrice)}</span>
          {originalPrice > comboPrice && (
            <span className="pb-0.5 text-sm text-slate-400 line-through">{fmt(originalPrice)}</span>
          )}
        </div>

        <p className="text-xs text-slate-500">
          {Array.isArray(combo?.items) ? `${combo.items.length} sản phẩm trong combo` : "Combo ưu đãi tại cửa hàng"}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function VoucherCard({ voucher }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{voucher?.couponCode || "Voucher"}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-950">{voucher?.couponName || "Ưu đãi tại quầy"}</h3>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
          ACTIVE
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-800">{formatVoucherBenefit(voucher)}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
        {voucher?.minPurchaseAmount ? <span>Mua từ {fmt(voucher.minPurchaseAmount)}</span> : <span>Áp dụng tại quầy</span>}
        {voucher?.endDate ? <span>• HSD {new Date(voucher.endDate).toLocaleDateString("vi-VN")}</span> : null}
      </div>
    </div>
  );
}

function SponsorCard({ ad, fallbackTitle }) {
  if (!ad) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-dashed border-slate-300 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Đối tác hiển thị</p>
        <h3 className="mt-2 text-lg font-bold text-slate-900">{fallbackTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Chưa có quảng cáo active cho vị trí này.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={ad?.imageUrl || PLACEHOLDER}
          alt={ad?.title || fallbackTitle}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{ad?.sponsorName || "Nhà tài trợ"}</p>
        <h3 className="line-clamp-2 text-base font-bold text-slate-950">{ad?.title || fallbackTitle}</h3>
      </div>
    </div>
  );
}

export default function EcommerceUI() {
  const { campaigns: activeCampaigns } = useActiveCampaigns();
  const activeCampaign = activeCampaigns.find(
    (campaign) => Boolean(campaign?.isHomepageBanner ?? campaign?.homepageBanner)
  ) || activeCampaigns[0] || null;
  const { variants: discountedVariants, loading: loadingDiscounted } = useDiscountedVariants();
  const { variants: allVariants, loading: loadingAll } = useAllVariants();
  const { vouchers, loading: loadingVouchers } = useVouchers();
  const { gifts, loading: loadingGifts } = useGifts();
  const { combos, loading: loadingCombos } = useProductCombos();
  const { categories: fetchedCategories } = useFetchCategories();
  const loadingProducts = loadingDiscounted || loadingAll;

  const [comboSliderPage, setComboSliderPage] = useState(0);
  const [giftSliderPage, setGiftSliderPage] = useState(0);
  const [showViewAll, setShowViewAll] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sponsorAds, setSponsorAds] = useState([]);

  const categoryOptions = useMemo(() => {
    const map = new Map();

    fetchedCategories.forEach((category) => {
      if (!category?.name || category?.id == null) return;
      map.set(String(category.id), { key: String(category.id), label: category.name });
    });

    allVariants.forEach((variant) => {
      const categoryId = getCategoryId(variant);
      const categoryName = getCategoryName(variant);
      if (!categoryName) return;

      const key = categoryId != null ? String(categoryId) : `name:${categoryName}`;
      if (!map.has(key)) {
        map.set(key, { key, label: categoryName });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [allVariants, fetchedCategories]);

  const sortedDiscounted = [...discountedVariants].sort((a, b) => getSaving(b) - getSaving(a));
  const activeCombos = [...combos]
    .filter((combo) => Boolean(combo?.isActive ?? true))
    .sort((a, b) => Number(a?.comboPrice || 0) - Number(b?.comboPrice || 0));
  const totalComboPages = Math.max(1, Math.ceil(activeCombos.length / PAGE_SIZE));
  const visibleComboItems = activeCombos.slice(
    comboSliderPage * PAGE_SIZE,
    comboSliderPage * PAGE_SIZE + PAGE_SIZE
  );
  const availableVouchers = vouchers.filter(isVoucherCurrentlyActive).slice(0, 6);
  const redeemableGifts = [...gifts]
    .filter((gift) => Number(gift?.stock || 0) > 0)
    .sort((a, b) => Number(a?.requiredPoints || 0) - Number(b?.requiredPoints || 0));
  const totalGiftPages = Math.max(1, Math.ceil(redeemableGifts.length / PAGE_SIZE));
  const visibleGiftItems = redeemableGifts.slice(
    giftSliderPage * PAGE_SIZE,
    giftSliderPage * PAGE_SIZE + PAGE_SIZE
  );

  const modalItems = sortedDiscounted.filter((v) => {
    const kw = modalSearch.toLowerCase().trim();
    return !kw || getSearchText(v).includes(kw);
  });

  const catalogItems = allVariants.filter((v) => {
    const kw = catalogSearch.toLowerCase().trim();
    const matchesSearch = !kw || getSearchText(v).includes(kw);
    const categoryId = getCategoryId(v);
    const categoryName = getCategoryName(v);
    const matchedCategory =
      categoryId == null && categoryName
        ? fetchedCategories.find((c) => c?.name === categoryName)
        : null;
    const categoryKey =
      categoryId != null
        ? String(categoryId)
        : matchedCategory?.id != null
          ? String(matchedCategory.id)
          : categoryName
            ? `name:${categoryName}`
            : null;
    const matchesCategory = categoryFilter === "all" || categoryKey === categoryFilter;

    if (!matchesSearch) return false;
    if (!matchesCategory) return false;
    return true;
  });

  const prevComboSlide = () => setComboSliderPage((p) => Math.max(0, p - 1));
  const nextComboSlide = () => setComboSliderPage((p) => Math.min(totalComboPages - 1, p + 1));
  const prevGiftSlide = () => setGiftSliderPage((p) => Math.max(0, p - 1));
  const nextGiftSlide = () => setGiftSliderPage((p) => Math.min(totalGiftPages - 1, p + 1));

  useEffect(() => {
    setComboSliderPage(0);
  }, [activeCombos.length]);

  useEffect(() => {
    setGiftSliderPage(0);
  }, [redeemableGifts.length]);

  useEffect(() => {
    let active = true;
    adService.getActive()
      .then((data) => {
        if (!active) return;
        const nextAds = [data?.LEFT || null, data?.RIGHT || null];
        setSponsorAds(nextAds);
      })
      .catch(() => {
        if (!active) return;
        setSponsorAds([null, null]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf3_0%,#f8fafc_100%)]">
      <div className="border-b border-amber-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">SmallTrend</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Localstore POS</p>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Đăng nhập
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]">
            <div className="relative h-[280px] overflow-hidden md:h-[340px]">
              {activeCampaign?.bannerImageUrl ? (
                <img
                  src={activeCampaign.bannerImageUrl}
                  alt={activeCampaign?.campaignName || "Banner sự kiện"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_48%,#7c2d12_100%)]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />

              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                Ưu đãi áp dụng trực tiếp tại cửa hàng
              </span>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-7">
              <h2 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
                {activeCampaign?.campaignName || "Cửa hàng trưng bày giá tốt và khuyến mãi đang áp dụng hôm nay"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                {activeCampaign?.description || "Trang chủ này dành cho mô hình local store POS: khách xem nhanh sản phẩm nổi bật, mức giá hiện tại và các chương trình đang áp dụng ngay tại quầy."}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-amber-700" />
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Voucher</h3>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {loadingVouchers ? (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Đang tải voucher...
                  </div>
                ) : availableVouchers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Chưa có voucher active.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {availableVouchers.map((voucher) => (
                      <VoucherCard key={voucher?.id || voucher?.couponCode} voucher={voucher} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SponsorCard ad={sponsorAds[0]} fallbackTitle="Quảng cáo nhà tài trợ" />
              <SponsorCard ad={sponsorAds[1]} fallbackTitle="Quảng cáo nhãn hàng hợp tác" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-4">
        <SectionTitle
          title="Combo ưu đãi"
          description=""
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        {loadingCombos ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">Đang tải combo ưu đãi...</div>
        ) : visibleComboItems.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">Chưa có combo ưu đãi để hiển thị.</div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            {totalComboPages > 1 && (
              <>
                <button
                  onClick={prevComboSlide}
                  disabled={comboSliderPage === 0}
                  className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextComboSlide}
                  disabled={comboSliderPage >= totalComboPages - 1}
                  className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${comboSliderPage * 100}%)` }}
            >
              {Array.from({ length: totalComboPages }).map((_, pageIndex) => {
                const items = activeCombos.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

                return (
                  <div key={pageIndex} className="w-full shrink-0 px-12 sm:px-14 lg:px-16">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((combo) => (
                        <ComboCard key={combo?.id || combo?.comboName} combo={combo} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <SectionTitle
          title="Quà có thể đổi"
          description=""
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        {loadingGifts ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">Đang tải ...</div>
        ) : visibleGiftItems.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">Chưa có quà khả dụng để đổi.</div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            {totalGiftPages > 1 && (
              <>
                <button
                  onClick={prevGiftSlide}
                  disabled={giftSliderPage === 0}
                  className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextGiftSlide}
                  disabled={giftSliderPage >= totalGiftPages - 1}
                  className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${giftSliderPage * 100}%)` }}
            >
              {Array.from({ length: totalGiftPages }).map((_, pageIndex) => {
                const items = redeemableGifts.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

                return (
                  <div key={pageIndex} className="w-full shrink-0 px-12 sm:px-14 lg:px-16">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((gift) => (
                        <GiftCard key={gift?.id || gift?.sku || gift?.name} gift={gift} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <SectionTitle
          title="Tra cứu nhanh tại cửa hàng"
          description=""
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, SKU, thương hiệu hoặc danh mục..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-950 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-950"
              >
                <option value="all">Tất cả danh mục</option>
                {categoryOptions.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            {loadingProducts ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-500">Đang tải sản phẩm...</div>
            ) : catalogItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-500">Không tìm thấy sản phẩm phù hợp.</div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {catalogItems.slice(0, 12).map((v) => (
                  <ProductCard key={v.sku} v={v} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showViewAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowViewAll(false); }}
        >
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Danh sách ưu đãi tại cửa hàng</h2>
                <p className="mt-1 text-sm text-slate-500">{sortedDiscounted.length} sản phẩm đang có giá ưu đãi hoặc coupon.</p>
              </div>
              <button
                onClick={() => setShowViewAll(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-950 hover:text-slate-950"
              >
                Đóng
              </button>
            </div>

            <div className="border-b px-6 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên, SKU hoặc thương hiệu..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalItems.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-500">Không tìm thấy sản phẩm.</div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {modalItems.map((v) => (
                    <ProductCard key={v.sku} v={v} compact />
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
