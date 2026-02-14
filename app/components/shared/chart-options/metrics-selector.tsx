import React from "react";
import { X, ChevronRight } from "lucide-react";
import fx from "~/assets/images/fx.svg";

interface MetricsSelectorProps {
  selectMetrics: { column: string; aggregateFunction: string }[];
  removeMetric: (column: string) => void;
  handleMetricModal: () => void;
}

const MetricsSelector: React.FC<MetricsSelectorProps> = ({
  selectMetrics,
  removeMetric,
  handleMetricModal,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="aggregate" className="text-xs font-semibold text-black">
        METRICS:
      </label>
      <div className="relative">
        <div>
          {selectMetrics.length > 0 ? (
            selectMetrics.map((metrics) => (
              <div
                className="my-3 border-0 bg-gray-200 h-10 flex items-center justify-between focus:ring-transparent rounded-full text-sm text-black px-5"
                key={`${metrics.column}-${metrics.aggregateFunction}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <img src={fx} alt="fx" className="w-8" />
                  <span>
                    {metrics.aggregateFunction
                      ? `${metrics.aggregateFunction?.toUpperCase()}(${
                          metrics.column
                        })`
                      : metrics.column}
                  </span>
                </div>
                <span
                  className="cursor-pointer"
                  onClick={() => removeMetric(metrics.column)}
                  aria-hidden="true"
                >
                  <X size={15} />
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No metrics selected</div>
          )}
        </div>
        <div
          className="border-0 bg-gray-200 h-10 flex items-center justify-between focus:ring-transparent rounded-full text-sm text-black px-5 cursor-pointer hover:border hover:border-primary"
          onClick={handleMetricModal}
          aria-hidden="true"
        >
          <span>Select metrics here</span>
          <ChevronRight size={15} />
        </div>
      </div>
    </div>
  );
};

export default MetricsSelector;
