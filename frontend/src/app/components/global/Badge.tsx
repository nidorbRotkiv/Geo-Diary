type BadgeProps = {
  isSelected: boolean;
  label: string;
  onClick: () => void;
};

export const Badge = ({ isSelected, label, onClick }: BadgeProps) => (
  <div
    className={`badge flex-1 mb-5 ${
      isSelected ? "badge-primary" : "badge-outline"
    } p-4 text-lg cursor-pointer text-center`}
    onClick={onClick}
  >
    {label}
  </div>
);