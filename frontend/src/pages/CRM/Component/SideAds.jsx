import { useState, useEffect } from "react";
import useAdvertisements from "../../../hooks/useAdvertisements";

const STORAGE_KEY = "smalltrend_side_ads";

const DEFAULT_ADS = [
  {
    slot: "left",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    title: "Mega Sale 50% OFF",
    subtitle: "Ưu đãi cuối tuần",
    ctaText: "Mua ngay",
    ctaColor: "#4f46e5",
    bgColor: "#ffffff",
    linkUrl: "",
  },
  {
    slot: "right",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    title: "Free Shipping",
    subtitle: "Đơn từ 200.000đ",
    ctaText: "Tìm hiểu thêm",
    ctaColor: "#059669",
    bgColor: "#ffffff",
    linkUrl: "",
  },
];

function AdPanel({ ad }) {
  if (!ad || !ad.isActive) return null;

  const content = (
    <div
      className="w-52 h-full shadow-xl overflow-hidden border flex flex-col rounded-2xl transition-transform hover:scale-[1.01]"
      style={{ backgroundColor: ad.bgColor || "#ffffff" }}
    >
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="h-2/3 w-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div className="h-2/3 w-full bg-slate-100" />
      )}
      <div className="flex-1 p-4 flex flex-col justify-center text-center gap-2">
        <p className="text-base font-bold text-slate-800 leading-tight">
          {ad.title}
        </p>
        {ad.subtitle && (
          <p className="text-xs text-slate-500">{ad.subtitle}</p>
        )}
        <button
          className="mt-2 text-white text-sm px-4 py-2 rounded-full font-semibold"
          style={{ backgroundColor: ad.ctaColor || "#4f46e5" }}
        >
          {ad.ctaText || "Xem ngay"}
        </button>
      </div>
    </div>
  );

  return ad.linkUrl ? (
    <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="h-full flex">
      {content}
    </a>
  ) : (
    <div className="h-full flex">{content}</div>
  );
}

export default function SideAds() {
  const { ads: adsFromAPI, loading } = useAdvertisements();
  const [displayAds, setDisplayAds] = useState(DEFAULT_ADS);

  useEffect(() => {
    if (adsFromAPI && (adsFromAPI.LEFT || adsFromAPI.RIGHT)) {
      // Convert API response to local format
      const leftAd = adsFromAPI.LEFT ? {
        ...adsFromAPI.LEFT,
        slot: "left",
      } : null;
      const rightAd = adsFromAPI.RIGHT ? {
        ...adsFromAPI.RIGHT,
        slot: "right",
      } : null;

      const ads = [];
      if (leftAd) ads.push(leftAd);
      if (rightAd) ads.push(rightAd);

      if (ads.length > 0) {
        setDisplayAds(ads);
      }
    }
  }, [adsFromAPI]);

  // Sync with storage for backward compatibility
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
          if (saved && Array.isArray(saved)) {
            setDisplayAds(saved);
          }
        } catch (err) {
          console.error("Failed to load ads from storage:", err);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const leftAd = displayAds.find((a) => a.slot === "left");
  const rightAd = displayAds.find((a) => a.slot === "right");

  return (
    <>
      {/* Left Ad */}
      <div className="hidden xl:flex fixed left-6 top-10 bottom-10 z-40">
        <AdPanel ad={leftAd} />
      </div>

      {/* Right Ad */}
      <div className="hidden xl:flex fixed right-6 top-10 bottom-10 z-40">
        <AdPanel ad={rightAd} />
      </div>
    </>
  );
}
