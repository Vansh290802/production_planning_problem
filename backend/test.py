import requests
import json

def call_scheduling_api():
    # API endpoint
    url = "http://localhost:8000/api/v1/schedule"
    
    # Sample data with working hours
    data = {
        "customers": ["A", "B", "C"],
        "machines": ["M1", "M2"],
        "specifications": ["Spec1", "Spec2"],
        "demands": [
            {"customer": "A", "spec": "Spec1", "quantity": 50},
            {"customer": "B", "spec": "Spec2", "quantity": 100},
            {"customer": "C", "spec": "Spec2", "quantity": 100}
        ],
        "machine_capacity_per_hour": {
            "M1": 7.0,
            "M2": 6.5
        },
        "cleaning_time": 3.0,
        "hours_per_day": 24,
        "changeover_cost": 100.0,
        "min_run_time": 2,
        "shift_start_hour": 0,
        "shift_end_hour": 24
    }

    try:
        # Make POST request
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        # Get results
        result = response.json()
        
        # Print optimization results
        print("\nOptimization Results:")
        print("-" * 50)
        print(f"Objective Value: {result['objective_value']}")
        print(f"Computation Time: {result['computation_time']} seconds")
        print(f"Status: {result['status']}")
        
        # Print schedule
        print("\nProduction Schedule:")
        print("-" * 50)
        print("Customer  Machine  Hour  Quantity  Spec")
        print("-" * 50)
        # Sort by machine and hour for better readability
        schedule = sorted(result['schedule'], key=lambda x: (x['machine'], x['hour']))
        for item in schedule:
            print(f"{item['customer']:8} {item['machine']:8} {item['hour']:4} {item['quantity']:9.1f} {item['spec']}")
            
        # Print changeovers
        print("\nChangeovers (Including Cleaning Time):")
        print("-" * 50)
        if result['changeovers']:
            print("Machine  Hour  From Spec  To Spec")
            print("-" * 50)
            changeovers = sorted(result['changeovers'], key=lambda x: (x['machine'], x['hour']))
            for change in changeovers:
                print(f"{change['machine']:8} {change['hour']:4} {change['from_spec']:10} {change['to_spec']}")
                print(f"        Cleaning time: Hours {change['hour']+1} to {change['hour']+3}")
        else:
            print("No changeovers in schedule")

    except requests.exceptions.RequestException as e:
        print(f"Error calling API: {e}")
        if hasattr(e.response, 'text'):
            print(f"Error details: {e.response.text}")

if __name__ == "__main__":
    call_scheduling_api()