import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import Typesense from "typesense";
import { DevTool } from "@/types";
import { Link } from "react-router-dom";

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

  return (
    <div className="relative" ref={searchRef}>
      <div
        className="flex items-center border rounded-md p-2 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search tools..."
          className="w-full outline-none"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {results.length === 0 && query !== "" ? (
            <div className="p-2 text-sm text-gray-500">No results found.</div>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={result.id} className="border-b last:border-b-0">
                  <Link
                    to={`/tools/${result.id}`}
                    className="block p-2 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="font-medium">{result.name}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
