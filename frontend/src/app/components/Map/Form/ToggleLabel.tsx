interface ToggleLabelProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

const ToggleLabel: React.FC<ToggleLabelProps> = ({ isActive, label, onClick }) => {
  return (
    <span
      className={`text-sm font-medium ${isActive ? "text-blue-500" : "text-gray-500"}`}
      onClick={onClick}
    >
      {label}
    </span>
  );
};

export default ToggleLabel;
