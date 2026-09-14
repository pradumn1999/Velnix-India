import React from 'react';
import { CheckCircle2, Clock, MapPin, Truck, ShieldCheck, Check } from 'lucide-react';
import { TrackingCheckpoint, OrderStatus } from '../../types';

interface OrderTrackingTimelineProps {
  checkpoints?: TrackingCheckpoint[];
  currentStatus?: OrderStatus;
  status?: OrderStatus;
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDeliveryDate?: string;
  className?: string;
}

const STAGES: { status: OrderStatus; label: string }[] = [
  { status: 'Order Placed', label: 'Order Placed' },
  { status: 'Payment Confirmed', label: 'Payment Confirmed' },
  { status: 'Processing', label: 'Processing' },
  { status: 'Shipped', label: 'Shipped' },
  { status: 'In Transit', label: 'In Transit' },
  { status: 'Out for Delivery', label: 'Out for Delivery' },
  { status: 'Delivered', label: 'Delivered' },
];

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  checkpoints = [],
  currentStatus,
  status,
  trackingNumber = 'BLUEDART-EXP-9921',
  courierPartner = 'BlueDart Express Air',
  estimatedDeliveryDate = 'In 2-3 Business Days',
  className = '',
}) => {
  const activeStatus = currentStatus || status || 'In Transit';
  const currentStageIndex = STAGES.findIndex((s) => s.status === activeStatus);

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Horizontal Step Bar (Desktop) */}
      <div className="hidden lg:block bg-neutral-50/60 p-6 rounded-3xl border border-neutral-200/80">
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">
          Milestone Progress
        </h4>

        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-neutral-200 -z-0" />
          {/* Active Connecting Line */}
          <div
            className="absolute left-6 top-4 h-0.5 bg-neutral-950 transition-all duration-500 -z-0"
            style={{
              width: `${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 92}%`,
            }}
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={stage.status} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-neutral-950 text-white'
                      : isCurrent
                      ? 'bg-amber-400 text-neutral-950 ring-4 ring-amber-100 shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Truck className="w-4 h-4 animate-bounce" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`text-[11px] mt-2 font-semibold text-center max-w-[80px] leading-tight ${
                    isCurrent
                      ? 'font-bold text-neutral-950'
                      : isCompleted
                      ? 'text-neutral-700'
                      : 'text-neutral-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Vertical Checkpoints Log (Mobile & Desktop) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs">
        <h4 className="text-sm font-extrabold text-neutral-950 mb-6 flex items-center gap-2 tracking-tight">
          <Clock className="w-4 h-4 text-neutral-500" />
          <span>Real-time Courier Log</span>
        </h4>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {checkpoints.map((cp, idx) => {
            return (
              <div key={idx} className="relative group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                    cp.completed
                      ? 'bg-neutral-950'
                      : cp.current
                      ? 'bg-amber-400 ring-4 ring-amber-100'
                      : 'bg-neutral-300'
                  }`}
                >
                  {cp.completed ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        cp.current
                          ? 'text-neutral-950'
                          : cp.completed
                          ? 'text-neutral-900'
                          : 'text-neutral-400'
                      }`}
                    >
                      {cp.label}
                    </span>
                    {cp.current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                        Live Milestone
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                    {cp.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5">
                    {cp.location && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span>{cp.location}</span>
                      </span>
                    )}
                    {cp.date && cp.date !== 'Pending' && (
                      <span className="font-mono">
                        {cp.date} {cp.time !== 'Pending' && `• ${cp.time}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
