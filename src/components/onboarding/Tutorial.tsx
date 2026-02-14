import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function Tutorial({ steps, onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (currentStepData?.target) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Update overlay to highlight element
        setTimeout(() => {
          const updatedRect = element.getBoundingClientRect();
          setOverlayStyle({
            clipPath: `polygon(
              0% 0%,
              0% 100%,
              ${updatedRect.left}px 100%,
              ${updatedRect.left}px ${updatedRect.top}px,
              ${updatedRect.right}px ${updatedRect.top}px,
              ${updatedRect.right}px ${updatedRect.bottom}px,
              ${updatedRect.left}px ${updatedRect.bottom}px,
              ${updatedRect.left}px 100%,
              100% 100%,
              100% 0%
            )`,
          });
        }, 500);
      }
    } else {
      setOverlayStyle({});
    }
  }, [currentStep, currentStepData]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          style={overlayStyle}
        />

        {/* Tooltip */}
        {currentStepData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md pointer-events-auto"
            style={{
              top: currentStepData.position === 'bottom' ? 'auto' : '50%',
              bottom: currentStepData.position === 'bottom' ? '2rem' : 'auto',
              left: currentStepData.position === 'right' ? 'auto' : '50%',
              right: currentStepData.position === 'right' ? '2rem' : 'auto',
              transform:
                currentStepData.position === 'center'
                  ? 'translate(-50%, -50%)'
                  : currentStepData.position === 'bottom'
                  ? 'translateX(-50%)'
                  : currentStepData.position === 'right'
                  ? 'translateY(-50%)'
                  : 'translate(-50%, -50%)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Skip tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-6">{currentStepData.content}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-emerald transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-emerald rounded-lg hover:bg-primary-forest transition-colors"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

