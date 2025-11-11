import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessItem } from '@/contexts/DataContext';

interface MessBoardProps {
  messItems: MessItem[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MessBoard: React.FC<MessBoardProps> = ({ messItems }) => {
  // Create a map of days to mess items for quick lookup
  const messMap = React.useMemo(() => {
    const map = new Map<string, MessItem>();
    messItems.forEach(item => {
      map.set(item.day, item);
    });
    return map;
  }, [messItems]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Weekly Mess Menu
        </h2>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-700">
                <TableRow className="border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 w-1/5">
                    Day
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 w-1/5">
                    Breakfast
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 w-1/5">
                    Lunch
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 w-1/5">
                    Snacks
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 w-1/5">
                    Dinner
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAYS.map((day, index) => {
                  const messItem = messMap.get(day);
                  return (
                    <TableRow
                      key={day}
                      className={`border-b border-gray-200 dark:border-gray-600 ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-750'
                      } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <TableCell className="py-4 px-4 text-gray-900 dark:text-gray-100 font-medium">
                        {day}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {messItem?.breakfast || '—'}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {messItem?.lunch || '—'}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {messItem?.snacks || '—'}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {messItem?.dinner || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
