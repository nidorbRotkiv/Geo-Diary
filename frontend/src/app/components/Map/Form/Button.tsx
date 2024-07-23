export default function Button({
  onClick,
  children,
  extraClasses = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  extraClasses?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-white rounded cursor-pointer p-1.5 hover:border-gray-400 dark:hover:border-gray-500 dark:shadow-md border dark:border-gray-700 transition-colors duration-500 ${extraClasses}`}
    >
      {children}
    </button>
  );
}
