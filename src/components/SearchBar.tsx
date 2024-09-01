import { useState, useRef, useEffect } from "react";
import Typesense from "typesense";
import { DevTool } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Command } from "./ui/command";
import { CommandIcon, LinkIcon, SquareChevronUp, X } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            navigate(`/tools/${results[selectedIndex].id}`);
            setIsOpen(false);
            handleReset();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, results, selectedIndex, navigate]);

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
          ref={inputRef}
          type="text"
          placeholder="Search tools..."
          className="w-full outline-none dark:text-white dark:bg-transparent text-xs md:text-base"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query ? (
          <X
            className="h-4 w-4 text-gray-500 cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
          />
        ) : (
          <div className="flex items-center text-gray-500 text-sm">
            {isMac ? <CommandIcon size={14} /> : <SquareChevronUp size={14} />}
            <span className="ml-1">K</span>
          </div>
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
                {results.map((result, index) => (
                  <li key={result.id} className="border-b last:border-b-0">
                    <Link
                      to={`/tools/${result.id}`}
                      className={`p-2 hover:bg-gray-200 dark:text-white dark:bg-transparent dark:hover:bg-gray-800 flex justify-between items-center ${
                        index === selectedIndex
                          ? "bg-gray-100 dark:bg-gray-700"
                          : ""
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        handleReset();
                      }}
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
