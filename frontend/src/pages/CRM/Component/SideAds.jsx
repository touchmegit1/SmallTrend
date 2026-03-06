import { useState, useEffect } from "react";
import adService from "../../../services/adService";

function AdPanel({ ad }) {
  if (!ad || !ad.isActive) return null;

  const content = (
    <div
      className="w-52 h-full shadow-xl overflow-hidden border flex flex-col rounded-2xl transition-transform hover:scale-[1.01]"
      style={{ backgroundColor: ad.bgColor || "#ffffff" }}
    >
      {ad.imageUrl ? (
        <img src={ad.imageUrl} alt={ad.title} className="h-2/3 w-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <div className="h-2/3 w-full bg-slate-100" />
      )}
      <div className="flex-1 p-4 flex flex-col justify-center text-center gap-2">
        {ad.sponsorName && (
          <p className="text-[10px] text-slate-400">{ad.sponsorName}</p>
        )}
        <p className="font-bold text-slate-800 leading-tight">{ad.title}</p>
        {ad.subtitle && <p className="text-xs text-slate-500">{ad.subtitle}</p>}
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
  const [leftAd, setLeftAd] = useState(null);
  const [rightAd, setRightAd] = useState(null);

  useEffect(() => {
    adService.getActive()
      .then((data) => {
        setLeftAd(data.LEFT || null);
        setRightAd(data.RIGHT || null);
      })
      .catch(() => {/* silently fail — no ads shown */ });
  }, []);

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


