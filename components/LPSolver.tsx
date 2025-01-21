"use client";

import { useState } from 'react';
import ProductionForm from './ProductionForm';
import ProductionResults from './ProductionResults';
import { Button } from './ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductionFormData {
  customers: string[];
  machines: {
    name: string;
    capacity: number;
  }[];
  specifications: string[];
  demands: Array<{
    customer: string;
    spec: string;
    quantity: number;
  }>;
  cleaning_time: number;
  hours_per_day: number;
  changeover_cost: number;
  min_run_time: number;
  shift_start_hour: number;
  shift_end_hour: number;
}

interface APIResponse {
  objective_value: number;
  computation_time: number;
  status: string;
  schedule: Array<{
    customer: string;
    machine: string;
    hour: number;
    quantity: number;
    spec: string;
  }>;
  changeovers: Array<{
    machine: string;
    hour: number;
    from_spec: string;
    to_spec: string;
  }>;
}

export const LPSolver = () => {
  const [solution, setSolution] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solveLP = async (params: ProductionFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert machines array to machine_capacity_per_hour object
      const machine_capacity_per_hour = params.machines.reduce((acc, machine) => {
        acc[machine.name] = machine.capacity;
        return acc;
      }, {} as Record<string, number>);

      // Prepare API request data
      const apiData = {
        customers: params.customers,
        machines: Object.keys(machine_capacity_per_hour),
        specifications: params.specifications,
        demands: params.demands,
        machine_capacity_per_hour,
        cleaning_time: params.cleaning_time,
        hours_per_day: params.hours_per_day,
        changeover_cost: params.changeover_cost,
        min_run_time: params.min_run_time,
        shift_start_hour: params.shift_start_hour,
        shift_end_hour: params.shift_end_hour
      };

      // Make API call to localhost:8000
      const response = await fetch('http://localhost:8000/api/v1/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get optimization results');
      }

      const result: APIResponse = await response.json();
      setSolution(result);
    } catch (err) {
      console.error('Error solving LP:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSolution(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!solution ? (
        <ProductionForm onSubmit={solveLP} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleReset} variant="outline">
              Start New Optimization
            </Button>
          </div>
          <ProductionResults 
            schedule={solution.schedule}
            changeovers={solution.changeovers}
            objective_value={solution.objective_value}
            status={solution.status}
          />
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