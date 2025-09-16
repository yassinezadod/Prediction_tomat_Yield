import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  CalenderIcon,
  CSVDown,
  ErrorIcon,
  FileTime,
  Folders,
  GroupIcon,
  Hour,
  Ruler,
  Target,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { UserCountResponse, usersService } from "../../services/usersService";
import { AdminKpis, UserKpis } from "../../types";


interface AdminKPIsProps {
  kpis: AdminKpis;
}

export default function AdminKPIs({ kpis }: AdminKPIsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">

      {/* Total Users */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {kpis.total_users}
            </h4>
          </div>
          <Badge color="success">
            <ArrowDownIcon />
          </Badge>
        </div>
      </div>

      {/* Total Datasets */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Folders className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Datasets
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {kpis.total_datasets}
            </h4>
          </div>
          <Badge color="info">
            <ArrowDownIcon />
          </Badge>
        </div>
      </div>

      {/* Last Dataset Uploaded */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CSVDown className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last File Uploaded
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-sm dark:text-white/90">
              {kpis.last_dataset?.file ?? "No file"}
            </h4>
          </div>
          <Badge color="warning">
            <ArrowDownIcon />
          </Badge>
        </div>
      </div>

      {/* Last Upload Date */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Hour className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last Upload Date
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-sm dark:text-white/90">
              {kpis.last_dataset?.date
                ? new Date(kpis.last_dataset.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No date"}
            </h4>
          </div>
          <Badge color="info">
            <ArrowDownIcon />
          </Badge>
        </div>
      </div>

      {/* Problematic Datasets */}
      

      {/* Total Predictions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Target className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Predictions
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {kpis.total_predictions}
            </h4>
          </div>
          <Badge color="success">
            <ArrowDownIcon />
          </Badge>
        </div>
      </div>

      {/* Total Logins */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <FileTime className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Logins
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {kpis.total_logins}
            </h4>
          </div>
          <Badge color="info">
            <ArrowDownIcon />
          </Badge>
        </div>
      </div>

    </div>
  );
}
