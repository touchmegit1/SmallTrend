export default function SideAds({
  leftImage,
  rightImage,
  leftTitle = "Mega Sale 50% OFF",
  rightTitle = "Free Shipping",
}) {
  return (
    <>
      {/* Left Ad */}
      <div className="hidden xl:flex fixed left-6 top-10 bottom-10 z-40">
        <div className="w-52 h-full bg-white shadow-xl overflow-hidden border flex flex-col rounded-2xl">
          <img
            src={leftImage}
            alt="left-ad"
            className="h-2/3 w-full object-cover"
          />
          <div className="flex-1 p-4 flex flex-col justify-center text-center">
            <p className="text-lg font-bold text-red-600">
              {leftTitle}
            </p>
            <button className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded-full">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Right Ad */}
      <div className="hidden xl:flex fixed right-6 top-10 bottom-10 z-40">
        <div className="w-52 h-full bg-white shadow-xl overflow-hidden border flex flex-col rounded-2xl">
          <img
            src={rightImage}
            alt="right-ad"
            className="h-2/3 w-full object-cover"
          />
          <div className="flex-1 p-4 flex flex-col justify-center text-center">
            <p className="text-lg font-bold text-green-600">
              {rightTitle}
            </p>
            <button className="mt-4 bg-black text-white text-sm px-4 py-2 rounded-full">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}