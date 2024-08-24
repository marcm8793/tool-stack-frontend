import { useState, useRef, useEffect } from "react";
import Typesense from "typesense";
import { DevTool } from "@/types";
import { Link } from "react-router-dom";
import { Command } from "./ui/command";
import { LinkIcon, X } from "lucide-react";

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: import.meta.env.VITE_TYPESENSE_HOST!,
      port: parseInt(import.meta.env.VITE_TYPESENSE_PORT!, 10),
      protocol: import.meta.env.VITE_TYPESENSE_PROTOCOL!,
    },
  ],
  apiKey: import.meta.env.VITE_TYPESENSE_API_KEY!,
  connectionTimeoutSeconds: 2,
});

const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DevTool[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 0) {
      try {
        const searchResults = await typesenseClient
          .collections("dev_tools")
          .documents()
          .search({
            q: searchQuery,
            query_by: "name,category,badges",
            per_page: 10,
          });
        const newResults =
          searchResults.hits?.map((hit) => hit.document as DevTool) || [];

        setResults(newResults);
      } catch (error) {
        console.error("Error searching Typesense:", error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleReset();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative w-64 h-9" ref={searchRef}>
      <div
        className="flex items-center border rounded-md p-2 cursor-text space-x-2 h-full"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          placeholder="Search tools..."
          className="w-full outline-none dark:text-white dark:bg-transparent"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <X
            className="h-4 w-4 text-gray-500 cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
          />
        )}
      </div>
      {isOpen && (
        <div className="absolute w-full mt-1 border rounded-md shadow-lg bg-white dark:bg-gray-800 z-10">
          <Command className="w-full max-h-[300px] overflow-y-auto">
            {results.length === 0 && query === "" ? (
              <div className="p-2 text-sm text-gray-500 dark:text-white dark:bg-transparent">
                Start typing to search...
              </div>
            ) : results.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 dark:text-white dark:bg-transparent">
                No results found.
              </div>
            ) : (
              <ul>
                {results.map((result) => (
                  <li key={result.id} className="border-b last:border-b-0">
                    <Link
                      to={`/tools/${result.id}`}
                      className="p-2 hover:bg-gray-100 dark:text-white dark:bg-transparent dark:hover:bg-gray-800 flex justify-between items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="font-medium">{result.name}</div>
                      <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Command>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
