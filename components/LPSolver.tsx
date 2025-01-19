"use client";

import { useState } from 'react';
import ProductionForm from './ProductionForm';
import ProductionResults from './ProductionResults';
import { Button } from './ui/button';

interface ProductionParameters {
  cleanTime: number;
  periodLength: number;
  changeCost: number;
  waitCost: number;
  emergencyCost: number;
  stockOutCost: number;
  specifications: Array<{
    name: string;
    maxProduction: number;
    priority: number;
    loyalDemand: number;
  }>;
}

interface Solution {
  schedule: Array<{
    specification: string;
    machine: string;
    period: number;
    quantity: number;
  }>;
  bufferTimes: Array<{
    specification: string;
    machine: string;
    period: number;
    time: number;
  }>;
  emergencyOrders: Array<{
    specification: string;
    machine: string;
    period: number;
  }>;
  totalCost: number;
}

const machines = ['Machine1', 'Machine2', 'Machine3'];
const periodsPerDay = 12;

export const LPSolver = () => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const solveLP = async (params: ProductionParameters) => {
    setIsLoading(true);
    try {
      // For demonstration purposes, creating a simulated solution
      // In production, this would be replaced with actual LP solving logic
      const simulatedSolution: Solution = {
        schedule: params.specifications.flatMap((spec) => 
          machines.flatMap((machine) => 
            Array.from({ length: 3 }, (_, i) => ({
              specification: spec.name,
              machine: machine,
              period: i,
              quantity: Math.floor(Math.random() * spec.maxProduction)
            }))
          )
        ),
        bufferTimes: machines.flatMap((machine) => 
          Array.from({ length: 2 }, (_, i) => ({
            specification: params.specifications[0]?.name || "Default",
            machine: machine,
            period: i,
            time: Math.random() * params.periodLength * 0.2
          }))
        ),
        emergencyOrders: machines.map((machine) => ({
          specification: params.specifications[0]?.name || "Default",
          machine: machine,
          period: 0
        })),
        totalCost: Math.random() * 10000
      };

      // Simulated delay to represent calculation time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSolution(simulatedSolution);
    } catch (error) {
      console.error('Error solving LP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSolution(null);
  };

  return (
    <div className="space-y-8">
      {!solution ? (
        <ProductionForm onSubmit={solveLP} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleReset} variant="outline">
              Start New Optimization
            </Button>
          </div>
          <ProductionResults {...solution} />
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg">Optimizing Production Schedule...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LPSolver;