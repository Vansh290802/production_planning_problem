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

interface ProductionSchedule {
  specification: string;
  machine: string;
  period: number;
  quantity: number;
}

interface BufferTime {
  specification: string;
  machine: string;
  period: number;
  time: number;
}

interface EmergencyOrder {
  specification: string;
  machine: string;
  period: number;
}

interface ProductionResultsProps {
  schedule: ProductionSchedule[];
  bufferTimes: BufferTime[];
  emergencyOrders: EmergencyOrder[];
  totalCost: number;
}

export const ProductionResults: React.FC<ProductionResultsProps> = ({
  schedule,
  bufferTimes,
  emergencyOrders,
  totalCost,
}) => {
  // Process data for charts
  const productionByPeriod = schedule.reduce((acc, item) => {
    const existing = acc.find(x => x.period === item.period);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ period: item.period, quantity: item.quantity });
    }
    return acc;
  }, [] as Array<{ period: number; quantity: number }>).sort((a, b) => a.period - b.period);

  const bufferByMachine = bufferTimes.reduce((acc, item) => {
    const existing = acc.find(x => x.machine === item.machine);
    if (existing) {
      existing.time += item.time;
    } else {
      acc.push({ machine: item.machine, time: item.time });
    }
    return acc;
  }, [] as Array<{ machine: string; time: number }>);

  const emergencyBySpec = emergencyOrders.reduce((acc, item) => {
    const existing = acc.find(x => x.specification === item.specification);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ specification: item.specification, count: 1 });
    }
    return acc;
  }, [] as Array<{ specification: string; count: number }>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Production Schedule Overview</CardTitle>
          <CardDescription>Total Cost: ${totalCost.toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" label={{ value: 'Time Period', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Production Quantity', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#8884d8" name="Production" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buffer Time by Machine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bufferByMachine}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="machine" />
                  <YAxis label={{ value: 'Buffer Time (hours)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="time" fill="#82ca9d" name="Buffer Time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Orders by Specification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergencyBySpec}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="specification" />
                  <YAxis label={{ value: 'Number of Emergency Orders', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" name="Emergency Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Buffer Time</TableHead>
                  <TableHead className="text-center">Emergency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item, index) => {
                  const buffer = bufferTimes.find(
                    b => b.period === item.period && 
                    b.machine === item.machine && 
                    b.specification === item.specification
                  );
                  const isEmergency = emergencyOrders.some(
                    e => e.period === item.period && 
                    e.machine === item.machine && 
                    e.specification === item.specification
                  );
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{item.specification}</TableCell>
                      <TableCell>{item.machine}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{buffer?.time || 0} hrs</TableCell>
                      <TableCell className="text-center">
                        {isEmergency ? '⚡' : '-'}
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

export default ProductionResults;