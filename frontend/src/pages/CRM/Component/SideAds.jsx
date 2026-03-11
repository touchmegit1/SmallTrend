import { useState, useEffect } from "react";
import useAdvertisements from "../../../hooks/useAdvertisements";

const DEFAULT_ADS = [
  {
    slot: "left",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    linkUrl: "",
  },
  {
    slot: "right",
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    linkUrl: "",
  },
];

function AdPanel({ ad }) {
  if (!ad || !ad.isActive) return null;

  const img = (
    <div className="w-52 h-full overflow-hidden rounded-2xl shadow-xl border border-white/20 transition-transform hover:scale-[1.015]">
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt="Advertisement"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div className="w-full h-full bg-slate-100" />
      )}
    </div>
  );

  return <div className="h-full flex">{img}</div>;
}

export default function SideAds() {
  const [displayAds, setDisplayAds] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("smalltrend_side_ads");
      if (saved) {
        setDisplayAds(JSON.parse(saved));
      }
    } catch {
      //
    }
  }, []);

  const leftAd = displayAds.find((a) => a.slot === "left" && a.isActive);
  const rightAd = displayAds.find((a) => a.slot === "right" && a.isActive);

  return (
    <>
      <div className="hidden xl:flex fixed left-6 top-10 bottom-10 z-40">
        <AdPanel ad={leftAd} />
      </div>
      <div className="hidden xl:flex fixed right-6 top-10 bottom-10 z-40">
        <AdPanel ad={rightAd} />
      </div>
    </>
  );
}
