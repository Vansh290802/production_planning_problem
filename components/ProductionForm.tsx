"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Plus, Trash2 } from 'lucide-react';

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

export const ProductionForm = ({ onSubmit }: { onSubmit: (data: ProductionFormData) => void }) => {
  const form = useForm<ProductionFormData>({
    defaultValues: {
      customers: ['A', 'B', 'C'],
      machines: [
        { name: 'M1', capacity: 7.0 },
        { name: 'M2', capacity: 6.5 }
      ],
      specifications: ['Spec1', 'Spec2'],
      demands: [],
      cleaning_time: 3.0,
      hours_per_day: 24,
      changeover_cost: 100.0,
      min_run_time: 2,
      shift_start_hour: 0,
      shift_end_hour: 24
    }
  });

  const addDemand = () => {
    const currentDemands = form.getValues('demands');
    form.setValue('demands', [
      ...currentDemands,
      {
        customer: form.getValues('customers')[0] || '',
        spec: form.getValues('specifications')[0] || '',
        quantity: 50
      }
    ]);
  };

  const removeDemand = (index: number) => {
    const currentDemands = form.getValues('demands');
    form.setValue('demands', currentDemands.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cleaning_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning Time (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Time needed for specification change</FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hours_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Per Day</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="changeover_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Changeover Cost</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_run_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Run Time</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Demands</h3>
                <Button type="button" onClick={addDemand} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Demand
                </Button>
              </div>

              {form.watch('demands').map((demand, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg relative">
                  <FormField
                    control={form.control}
                    name={`demands.${index}.customer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`demands.${index}.spec`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specification</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`demands.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => removeDemand(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            Generate Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductionForm;