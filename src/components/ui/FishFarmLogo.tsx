import logoImg from "@/assets/logo.png";

export function FishFarmLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          src={logoImg}
          alt="FishFarm OS logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to SVG if image fails
            (e.target as HTMLElement).style.display = "none";
            const svgFallback = (e.target as HTMLElement).nextElementSibling;
            if (svgFallback) (svgFallback as HTMLElement).style.display = "block";
          }}
        />
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[#0F6236] hidden"
          fill="currentColor"
        >
          {/* Leaf / Fish Logo SVG fallback */}
          <path d="M50 8C26.8 8 8 26.8 8 50s18.8 42 42 42 42-18.8 42-42S73.2 8 50 8zm0 76c-18.7 0-34-15.3-34-34s15.3-34 34-34 34 15.3 34 34-15.3 34-34 34z" opacity="0.1" />
          <path d="M50 20C35 20 22 30 20 45c3 15 15 25 30 25 15 0 27-10 30-25-2-15-15-25-30-25zm0 38c-8.3 0-15-6.7-15-13s6.7-13 15-13 15 6.7 15 13-6.7 13-15 13z" />
          <circle cx="58" cy="42" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="mt-2 text-center leading-tight">
        <h1 className="text-[28px] font-extrabold text-[#0F6236] tracking-tight">
          FishFarm OS
        </h1>
        <p className="text-[12px] font-bold tracking-[0.45em] text-[#0F6236] mt-1 pl-1">
          GHANA
        </p>
      </div>
    </div>
  );
}
