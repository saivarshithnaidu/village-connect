'use client';

import { FiMapPin, FiCheckCircle, FiUserCheck, FiSettings, FiStar } from 'react-icons/fi';

interface StepTimestamps {
  reportedAt?: string;
  verifiedAt?: string;
  assignedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
}

interface StatusTimelineProps {
  status: string;
  isVerified: boolean;
  assignedTo?: string;
  timestamps?: StepTimestamps;
}

export default function StatusTimeline({ status, isVerified, assignedTo, timestamps = {} }: StatusTimelineProps) {
  const isAssigned = !!assignedTo;
  const isInProgress = status === 'in-progress' || status === 'resolved' || status === 'completed' || status === 'closed';
  const isCompleted = status === 'resolved' || status === 'completed' || status === 'closed';

  const steps = [
    { key: 'reported', label: 'Reported', icon: <FiMapPin />, completed: true, time: timestamps.reportedAt },
    { key: 'verified', label: 'Verified', icon: <FiCheckCircle />, completed: isVerified, time: timestamps.verifiedAt },
    { key: 'assigned', label: 'Assigned', icon: <FiUserCheck />, completed: isAssigned, time: timestamps.assignedAt },
    { key: 'in-progress', label: 'In Progress', icon: <FiSettings />, completed: isInProgress, time: timestamps.inProgressAt },
    { key: 'completed', label: 'Completed', icon: <FiStar />, completed: isCompleted, time: timestamps.completedAt },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl mb-12">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 border-b border-slate-50 pb-4">
        Resolution Journey
      </h3>
      <div className="flex flex-col relative">
        {/* Connection Line */}
        <div className="absolute top-6 bottom-6 left-6 w-1 bg-slate-100 z-0"></div>
        
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-row items-start gap-6 relative z-10 mb-8 last:mb-0 group">
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${step.completed ? 'bg-green-600 text-white shadow-green-200' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
              {step.icon}
            </div>
            <div className="flex-1 pt-1">
               <p className={`text-sm font-black uppercase tracking-widest ${step.completed ? 'text-green-600' : 'text-slate-400'}`}>
                 {step.label}
               </p>
               {step.completed && step.time ? (
                 <p className="text-xs font-bold text-slate-400 mt-1">
                   {new Date(step.time).toLocaleString()}
                 </p>
               ) : (
                 <p className="text-[10px] font-bold text-slate-300 uppercase mt-1 tracking-widest">
                   {step.completed ? 'COMPLETED' : 'PENDING'}
                 </p>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
