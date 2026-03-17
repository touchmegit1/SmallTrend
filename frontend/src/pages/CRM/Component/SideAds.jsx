import { useState, useEffect } from "react";
import adService from "../../../services/adService";

function AdPanel({ ad }) {
  if (!ad || !ad.isActive) return null;

  return (
    <div className="w-52 h-full shadow-xl overflow-hidden border flex flex-col rounded-2xl bg-white">
      {ad.imageUrl ? (
        <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <div className="h-full w-full bg-slate-100" />
      )}
    </div>
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


