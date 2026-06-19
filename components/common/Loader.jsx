export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-16 h-16">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>

        {/* Inner spinning ring (opposite direction) */}
        <div className="absolute inset-2 border-4 border-transparent border-b-blue-400 border-l-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>
      <p className="ml-4 text-gray-600 font-medium">Loading...</p>
    </div>
  );
}
