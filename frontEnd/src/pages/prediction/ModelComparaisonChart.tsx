import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ModelComparaisonChartProps {
  csvData?: any[];
}

export default function ModelComparaisonChart({ csvData = [] }: ModelComparaisonChartProps) {
  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {}
  });

  // Générer les données du graphique à partir des données CSV
  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      // Données par défaut si pas de données
      const defaultSeries = [
        {
          name: "Prédictions",
          data: []
        },
        {
          name: "Valeurs Réelles",
          data: []
        }
      ];

      setChartData({
        series: defaultSeries,
        options: getChartOptions([])
      });
      return;
    }

    // Préparer les données pour le graphique
    const weeks = csvData.map(row => row.Semaine);
    const predictions = csvData.map(row => parseFloat(row.Prediction_Rendement) || 0);
    const actuals = csvData.map(row => parseFloat(row.Rendement_Actual) || 0);

    const series = [
      {
        name: "Prédictions",
        data: predictions,
        color: "#3b82f6" // Bleu
      },
      {
        name: "Valeurs Réelles", 
        data: actuals,
        color: "#22c55e" // Vert
      }
    ];

    setChartData({
      series,
      options: getChartOptions(weeks)
    });
  }, [csvData]);

  const getChartOptions = (categories: string[]): ApexOptions => ({
    chart: {
      type: "line",
      height: 280, // Hauteur réduite
      toolbar: {
        show: true,
        offsetY: 0, // Pas de décalage pour éviter le débordement
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: '#fff',
      hover: {
        size: 8
      }
    },
    colors: ["#3b82f6", "#22c55e"],
    xaxis: {
      categories: categories.length > 0 ? categories : ["Aucune donnée"],
      title: {
        text: "Numéro de Semaine",
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#374151"
        }
      },
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px"
        }
      },
      axisBorder: {
        show: true,
        color: "#e5e7eb"
      },
      axisTicks: {
        show: true,
        color: "#e5e7eb"
      }
    },
    yaxis: {
      title: {
        text: "Rendement (t/ha)",
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#374151"
        }
      },
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px"
        },
        formatter: (value) => {
          return value ? value.toFixed(2) : "0.00";
        }
      },
      axisBorder: {
        show: true,
        color: "#e5e7eb"
      }
    },
    grid: {
      show: true,
      borderColor: "#f3f4f6",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0, // Pas de padding supplémentaire
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    legend: {
      show: true,
      position: "bottom", // Légende en bas pour éviter les conflits
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 500,
      offsetY: 0,
      labels: {
        colors: "#374151"
      },
      markers: {
        size: 6
      },
      itemMargin: {
        horizontal: 20,
        vertical: 5
      }
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: "light",
      style: {
        fontSize: "12px"
      },
      x: {
        show: true
      },
      y: {
        formatter: (value) => {
          return value ? `${value.toFixed(2)} t/ha` : "N/A";
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.1,
        gradientToColors: ["#60a5fa", "#4ade80"],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            offsetY: 0
          }
        }
      }
    ]
  });

  // Calculer quelques statistiques rapides
  const getQuickStats = () => {
    if (!csvData || csvData.length === 0) return null;

    const predictions = csvData.map(row => parseFloat(row.Prediction_Rendement) || 0);
    const actuals = csvData.map(row => parseFloat(row.Rendement_Actual) || 0);

    const avgPrediction = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const avgActual = actuals.reduce((a, b) => a + b, 0) / actuals.length;
    const maxDifference = Math.max(...csvData.map(row => Math.abs(
      (parseFloat(row.Prediction_Rendement) || 0) - (parseFloat(row.Rendement_Actual) || 0)
    )));

    return {
      avgPrediction: avgPrediction.toFixed(2),
      avgActual: avgActual.toFixed(2),
      maxDifference: maxDifference.toFixed(2),
      totalPoints: csvData.length
    };
  };

  const stats = getQuickStats();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
Comparison Predictions vs Actual Values
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
Evolution of predictions compared to actual values per week          </p>
        </div>
        
        {/* Statistiques rapides */}
        {stats && (
          <div className="flex items-start w-full gap-3 sm:justify-end">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-blue-600 font-semibold">{stats.avgPrediction}</div>
                <div className="text-gray-500 text-xs">Moy. Prédictions</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-semibold">{stats.avgActual}</div>
                <div className="text-gray-500 text-xs">Moy. Réelles</div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Graphique */}
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            {csvData && csvData.length > 0 ? (
              <Chart 
                options={chartData.options} 
                series={chartData.series} 
                type="line" 
                height={280}
              />
            ) : (
              <div className="flex items-center justify-center h-[280px] bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 text-lg mb-2">📊</div>
                  <p className="text-gray-500 text-sm">Aucune donnée à afficher</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Veuillez télécharger vos fichiers CSV pour voir la comparaison
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Informations additionnelles */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Points de données: {stats.totalPoints}</span>
            <span>Écart max: {stats.maxDifference} t/ha</span>
          </div>
        </div>
      )}
    </div>
  );
}