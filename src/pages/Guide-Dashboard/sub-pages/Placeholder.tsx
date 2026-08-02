interface PlaceholderProps {
  title: string;
}

export default function GuidePlaceholder({ title }: PlaceholderProps) {
  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm p-10 text-center">
      <h2 className="text-xl font-bold text-[#1a130e] font-serif">{title}</h2>
      <p className="text-sm text-gray-400 mt-2">Coming soon</p>
    </div>
  );
}
