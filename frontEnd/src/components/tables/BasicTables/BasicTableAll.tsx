import { AngleLeftIcon } from "../../../icons"; 
import Button from "../../ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useLocation, useNavigate } from "react-router-dom";

interface BasicTableOneProps {
  data: any[];
}

export default function BasicTableAll({ data }: BasicTableOneProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] gap-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
      
      {/* Header avec Grid - Largeur STRICTEMENT limitée */}
      <div className="w-full grid grid-cols-[1fr_auto] gap-4 items-center min-w-0">
        <div className="min-w-0"> {/* ✅ Permet au contenu de se réduire */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 truncate">
            Prediction Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {data.length} yield forecast{data.length > 1 ? "s" : ""} available
          </p>
        </div>

        <div className="flex-shrink-0"> {/* ✅ Bouton ne rétrécit jamais */}
          <Button
            size="md"
            variant="outline"
            startIcon={<AngleLeftIcon className="size-5" />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      </div>

      {/* ✅ Conteneur table avec largeur FORCÉE à 0 puis expansion contrôlée */}
      <div className="min-w-0 min-h-0 w-full h-full rounded-xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
        
        {/* ✅ Couche d'isolation - cette div ne peut PAS dépasser son parent */}
        <div className="w-full h-full relative">
          
          {/* ✅ Zone de scroll - isolée et ne peut pas affecter les parents */}
          <div className="absolute inset-0 overflow-auto">
            
            {/* ✅ Table avec largeur naturelle mais contenue */}
            <div style={{ width: 'max-content', minWidth: '100%' }}>
              <Table className="text-sm border-collapse">
                
                {/* Header sticky */}
                {data.length > 0 && (
                  <TableHeader>
                    <TableRow className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
                      {Object.keys(data[0]).map((key) => (
                        <TableCell
                          key={key}
                          isHeader
                          className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap bg-gray-50 dark:bg-gray-800"
                          
                        >
                          {key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                )}

                {/* Rows */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {data.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      {Object.values(row).map((val, i) => (
                        <TableCell
                          key={i}
                          className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                          
                        >
                          {String(val)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}