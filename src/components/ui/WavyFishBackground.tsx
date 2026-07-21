export function WavyFishBackground() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-0">
      <svg
        className="relative block w-full h-[130px]"
        viewBox="0 0 430 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Soft background wave 1 */}
        <path
          d="M0,55 C120,30 260,85 430,40 L430,130 L0,130 Z"
          fill="#D9EDE0"
          opacity="0.6"
        />
        {/* Soft background wave 2 */}
        <path
          d="M0,70 C140,45 280,95 430,60 L430,130 L0,130 Z"
          fill="#C8E7D3"
          opacity="0.8"
        />
        {/* Main front wave */}
        <path
          d="M0,88 C130,68 270,105 430,80 L430,130 L0,130 Z"
          fill="#B6DFC4"
        />

        {/* Swimming Fish Silhouettes */}
        {/* Fish 1 (Left small) */}
        <g transform="translate(85, 108) scale(0.55)" fill="#68B486" opacity="0.65">
          <path d="M0,8 C10,2 25,2 35,8 C40,10 48,6 52,2 C50,12 50,16 52,26 C48,22 40,18 35,20 C25,26 10,26 0,20 C-4,17 -4,11 0,8 Z" />
          <polygon points="-2,14 -10,8 -6,14 -10,20" />
        </g>

        {/* Fish 2 (Middle small) */}
        <g transform="translate(200, 98) scale(0.65)" fill="#56A575" opacity="0.7">
          <path d="M0,8 C10,2 25,2 35,8 C40,10 48,6 52,2 C50,12 50,16 52,26 C48,22 40,18 35,20 C25,26 10,26 0,20 C-4,17 -4,11 0,8 Z" />
          <polygon points="-2,14 -10,8 -6,14 -10,20" />
        </g>

        {/* Fish 3 (Right medium) */}
        <g transform="translate(255, 90) scale(0.85)" fill="#439663" opacity="0.75">
          <path d="M0,8 C10,2 25,2 35,8 C40,10 48,6 52,2 C50,12 50,16 52,26 C48,22 40,18 35,20 C25,26 10,26 0,20 C-4,17 -4,11 0,8 Z" />
          <polygon points="-2,14 -10,8 -6,14 -10,20" />
        </g>

        {/* Fish 4 (Far Right Large) */}
        <g transform="translate(315, 82) scale(1.1)" fill="#2F8550" opacity="0.8">
          <path d="M0,8 C10,2 25,2 35,8 C40,10 48,6 52,2 C50,12 50,16 52,26 C48,22 40,18 35,20 C25,26 10,26 0,20 C-4,17 -4,11 0,8 Z" />
          <polygon points="-2,14 -10,8 -6,14 -10,20" />
          <circle cx="28" cy="10" r="1.5" fill="#B6DFC4" />
        </g>
      </svg>
    </div>
  );
}
