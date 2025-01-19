"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface ProductionFormData {
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

export const ProductionForm = ({ onSubmit }: { onSubmit: (data: ProductionFormData) => void }) => {
  const form = useForm<ProductionFormData>({
    defaultValues: {
      cleanTime: 2.5,
      periodLength: 2,
      changeCost: 100,
      waitCost: 50,
      emergencyCost: 200,
      stockOutCost: 300,
      specifications: []
    }
  });

  const addSpecification = () => {
    const currentSpecs = form.getValues('specifications');
    form.setValue('specifications', [
      ...currentSpecs,
      {
        name: `Specification ${currentSpecs.length + 1}`,
        maxProduction: 100,
        priority: 1,
        loyalDemand: 50
      }
    ]);
  };

  const removeSpecification = (index: number) => {
    const currentSpecs = form.getValues('specifications');
    form.setValue('specifications', currentSpecs.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cleanTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clean Time (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Average time needed for specification change</FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="periodLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Length (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Length of each production period</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="changeCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Cost</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Cost of specification change</FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="waitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wait Cost</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Cost per period of delayed order</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Cost</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Premium cost for emergency orders</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockOutCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Out Cost</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Cost of failing to meet loyal customer demand</FormDescription>
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
                <h3 className="text-lg font-semibold">Specifications</h3>
                <Button type="button" onClick={addSpecification} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Specification
                </Button>
              </div>

              {form.watch('specifications').map((spec, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg relative">
                  <FormField
                    control={form.control}
                    name={`specifications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`specifications.${index}.maxProduction`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Production</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`specifications.${index}.priority`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="5" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`specifications.${index}.loyalDemand`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loyal Demand</FormLabel>
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
                    onClick={() => removeSpecification(index)}
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
            Optimize Production
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductionForm;