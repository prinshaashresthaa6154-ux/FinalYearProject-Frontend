import { Search } from "lucide-react";
import Input from "./Input";

type SearchBarProps = { value: string; onChange: (value: string) => void; placeholder?: string; label?: string };

export default function SearchBar({ value, onChange, placeholder = "Search", label = "Search" }: SearchBarProps) {
  return <div className="relative"><Search className={`pointer-events-none absolute left-3 h-4 w-4 text-black/45 ${label ? "top-[2.7rem]" : "top-1/2 -translate-y-1/2"}`} /><Input label={label} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9" /></div>;
}
