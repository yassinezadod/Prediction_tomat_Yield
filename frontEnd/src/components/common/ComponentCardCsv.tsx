interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}
import Button from "../../components/ui/button/Button";
import { CSVDown } from "../../icons";
import { predictionService } from "../../services/predictionService";

const ComponentCardCSV: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  const download = async () => {
    try {
      await predictionService.downloadTemplate();
    } catch (error) {
      console.error("Erreur lors du téléchargement du template:", error);
    }
  };
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
<div className="px-6 py-5 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </p>
        )}
        <div className="flex items-center gap-3">
            <Button
              size="md"
              variant="outline"
              startIcon={<CSVDown className="size-5" />}
              onClick={download}
            >
    Download CSV Template
            </Button>

          
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCardCSV;
