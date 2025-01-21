// ProductionResults.tsx
"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ScheduleItem {
  customer: string;
  machine: string;
  hour: number;
  quantity: number;
  spec: string;
}

interface Changeover {
  machine: string;
  hour: number;
  from_spec: string;
  to_spec: string;
}

interface ProductionResultsProps {
  schedule: ScheduleItem[];
  changeovers: Changeover[];
  objective_value: number;
  status: string;
}

export const ProductionResults: React.FC<ProductionResultsProps> = ({
  schedule,
  changeovers,
  objective_value,
  status,
}) => {
  // Process data for charts
  const productionByHour = schedule.reduce((acc, item) => {
    const existing = acc.find(x => x.hour === item.hour);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ hour: item.hour, quantity: item.quantity });
    }
    return acc;
  }, [] as Array<{ hour: number; quantity: number }>).sort((a, b) => a.hour - b.hour);

  const productionByMachine = schedule.reduce((acc, item) => {
    const existing = acc.find(x => x.machine === item.machine);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ machine: item.machine, quantity: item.quantity });
    }
    return acc;
  }, [] as Array<{ machine: string; quantity: number }>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Production Schedule Overview</CardTitle>
          <CardDescription>
            Objective Value: {objective_value.toFixed(2)} | Status: {status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Production Quantity', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#8884d8" name="Production" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production by Machine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionByMachine}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="machine" />
                <YAxis label={{ value: 'Total Production', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#82ca9d" name="Total Production" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hour</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.hour}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell>{item.machine}</TableCell>
                    <TableCell>{item.spec}</TableCell>
                    <TableCell className="text-right">{item.quantity.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {changeovers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Changeovers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hour</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>From Spec</TableHead>
                    <TableHead>To Spec</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeovers.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell>{change.hour}</TableCell>
                      <TableCell>{change.machine}</TableCell>
                      <TableCell>{change.from_spec}</TableCell>
                      <TableCell>{change.to_spec}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionResults;
