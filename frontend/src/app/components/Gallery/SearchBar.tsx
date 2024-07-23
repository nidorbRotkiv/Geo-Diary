interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => (
  <div className="flex items-center space-x-2">
    <label htmlFor="search" className="text-white dark:text-slate-300 text-xl">
      Search:
    </label>
    <input
      id="search"
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="p-1 rounded bg-white dark:bg-black text-black dark:text-slate-300 select-none focus:outline-none focus:ring-0"
    />
  </div>
);

export default SearchBar;
