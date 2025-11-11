import React, { useState, useEffect } from "react";

interface Timetable {
  id: number;
  route_name: string;
  schedule: string;
}

const BusTimetableView: React.FC = () => {
  const [routes, setRoutes] = useState<Timetable[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/timetable")
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        Bus Timetable
      </h1>

      {routes.map((r) => (
        <div
          key={r.id}
          className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
        >
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {r.route_name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {r.schedule.split(",").map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100"
              >
                {t.trim()}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusTimetableView;
