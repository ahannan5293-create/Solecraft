export default function Loading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#6C5CE7]"></div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading</p>
      </div>
    </div>
  );
}
