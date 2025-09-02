import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";


interface DropzoneCSVComponentProps {
  onDataParsed: (data: any[]) => void; // ✅ callback pour remonter les données
}

const DropzoneCSVComponent: React.FC<DropzoneCSVComponentProps> = ({ onDataParsed }) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);

    if (acceptedFiles.length > 0) {
      Papa.parse(acceptedFiles[0], {
        header: true, // ✅ CSV avec header
        skipEmptyLines: true,
        complete: (result: { data: any[]; }) => {
          console.log("CSV Parsed:", result.data);
          onDataParsed(result.data as any[]); // ✅ envoie au parent
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const borderColor = files.length > 0
    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
    : isDragActive
    ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900";

  return (
    <ComponentCard title="Dropzone">
      <div className="transition border border-dashed cursor-pointer dark:border-gray-700 rounded-xl">
        <form {...getRootProps()} className={`dropzone rounded-xl border-dashed p-7 lg:p-10 ${borderColor}`}>
          <input {...getInputProps()} />

          <div className="dz-message flex flex-col items-center">
            {files.length > 0 ? (
              <h4 className="mb-3 font-semibold text-green-700 dark:text-green-300">
                {files[0].name} 
              </h4>
            ) : (
              <>
                <h4 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                  {isDragActive ? "Drop CSV File Here" : "Drag & Drop CSV File Here"}
                </h4>
                <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                  Drag and drop your CSV file here or browse
                </span>
                <span className="font-medium underline text-theme-sm text-brand-500">
                  Browse File
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </ComponentCard>
  );
};

export default DropzoneCSVComponent;
