interface SortSelectorProps {
  sortMethod: string;
  setSortMethod: (method: string) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({ sortMethod, setSortMethod }) => (
  <div className="flex items-center space-x-2">
    <label htmlFor="sort" className="text-white dark:text-slate-300 text-xl">
      Sort by:
    </label>
    <select
      id="sort"
      value={sortMethod}
      onChange={(e) => setSortMethod(e.target.value)}
      className="p-1 rounded bg-white dark:bg-black text-black dark:text-slate-300 select-none focus:outline-none focus:ring-0"
    >
      <option value="date">Date</option>
      <option value="distance">Distance</option>
      <option value="title">Title</option>
    </select>
  </div>
);

export default SortSelector;