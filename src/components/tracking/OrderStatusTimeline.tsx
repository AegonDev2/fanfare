import { CheckCircle, Clock, Package, Truck, XCircle, AlertCircle } from "lucide-react";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/types/tracking";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  isInfluencer?: boolean;
}

const OrderStatusTimeline = ({ currentStatus, isInfluencer = false }: OrderStatusTimelineProps) => {
  const fanSteps: OrderStatus[] = [
    'order_placed',
    'waiting_admin_approval', 
    'waiting_acceptance',
    'accepted',
    'completed'
  ];

  const influencerSteps: OrderStatus[] = [
    'waiting_acceptance',
    'accepted', 
    'completed'
  ];

  const steps = isInfluencer ? influencerSteps : fanSteps;
  
  const getStepIcon = (step: OrderStatus, isActive: boolean, isCompleted: boolean) => {
    const iconProps = { 
      className: `w-4 h-4 ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'}` 
    };

    switch (step) {
      case 'order_placed':
        return <Package {...iconProps} />;
      case 'waiting_admin_approval':
        return <Clock {...iconProps} />;
      case 'waiting_acceptance':
        return <AlertCircle {...iconProps} />;
      case 'accepted':
        return <CheckCircle {...iconProps} />;
      case 'completed':
        return <Truck {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getCurrentStepIndex = () => {
    if (['rejected', 'cancelled'].includes(currentStatus)) {
      return -1; // Special handling for terminal states
    }
    return steps.indexOf(currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  // Don't show timeline for rejected/cancelled orders
  if (['rejected', 'cancelled'].includes(currentStatus)) {
    const config = ORDER_STATUS_CONFIG[currentStatus];
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
        <XCircle className="w-5 h-5 text-red-600" />
        <div>
          <span className="font-medium text-red-800">{config.label}</span>
          <p className="text-sm text-red-600">{config.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 mb-3">Order Progress</h4>
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const config = ORDER_STATUS_CONFIG[step];
          
          return (
            <div key={step} className="flex items-center relative">
              {/* Timeline line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-2 top-8 w-0.5 h-8 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}
              
              {/* Step indicator */}
              <div className={`relative z-10 flex items-center gap-3 p-2 rounded-lg ${
                isActive ? 'bg-primary/10 border border-primary/20' : ''
              }`}>
                <div className={`rounded-full p-1 ${
                  isActive ? 'bg-primary text-primary-foreground' : 
                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>
                  {getStepIcon(step, isActive, isCompleted)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    isActive ? 'text-primary' : 
                    isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {config.label}
                  </p>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;