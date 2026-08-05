import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";

interface SearchBarProps {
    placeholder: string;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export default function SearchBar({
    placeholder,
    searchTerm,
    onSearchChange,
}: SearchBarProps) {
    return (
        <div className="relative mb-7 w-full rounded-full shadow-sm transition-all duration-300 focus-within:shadow-md hover:shadow-md">
            <div className="relative">
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform duration-200 group-hover:scale-125"
                />

                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={placeholder}
                    className="h-14 w-full rounded-full border border-zinc-200 bg-white px-12 text-zinc-900 outline-none transition-all focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 placeholder:select-none font-medium"
                />

                {searchTerm && (
                    <Button
                        variant="ghost"
                        onClick={() => onSearchChange("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        aria-label="Clear search"
                    >
                        <FontAwesomeIcon
                            icon={faX}
                            className="transition-transform duration-200 group-hover:scale-125"
                        />
                    </Button>
                )}
            </div>
        </div>
    );
}