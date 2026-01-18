import React from 'react';

interface AssessmentProgressProps {
  currentStep: 1 | 2 | 3;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'จำคำศัพท์' },
    { id: 2, label: 'วาดนาฬิกา' },
    { id: 3, label: 'ตอบคำศัพท์' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in">
      {/* Header Label */}
      <div className="flex items-center gap-3 mb-4 pl-1">
        <div className="relative flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-primary"></span>
        </div>
        <span className="text-xl md:text-2xl font-bold text-primary">กำลังทดสอบ Cognition</span>
      </div>

      {/* Progress Tabs */}
      <div className="flex w-full gap-2 md:gap-4">
        {steps.map((step) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          let containerClasses = "";
          
          if (isCurrent) {
            // Current Step: Blue, Prominent
            containerClasses = "bg-blue-50 text-primary border-primary ring-2 ring-blue-200 shadow-lg scale-[1.02] z-10";
          } else if (isCompleted) {
            // Completed Step: Green (Optional but helpful context)
            containerClasses = "bg-green-50 text-green-700 border-green-200 opacity-90";
          } else {
            // Future Step: Gray, Receded
            containerClasses = "bg-gray-50 text-gray-400 border-gray-200";
          }

          return (
            <div
              key={step.id}
              className={`
                flex-1 
                h-16 md:h-20
                rounded-xl md:rounded-2xl
                flex items-center justify-center
                text-lg md:text-2xl font-bold
                border-2
                transition-all duration-300
                ${containerClasses}
              `}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="hidden md:inline mr-2 opacity-70">{step.id}.</span>
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};