"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Step1Property } from "./Step1Property";
import { Step2Tenant } from "./Step2Tenant";
import { Step3Reminders } from "./Step3Reminders";

interface Props {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const handleSkip = () => {
    localStorage.setItem("rentaryto_onboarding_completed", "true");
    onComplete();
  };

  const handleStep1Complete = (id: string) => {
    setPropertyId(id);
    setCurrentStep(2);
  };

  const handleStep2Complete = () => {
    setCurrentStep(3);
  };

  const handleStep3Complete = () => {
    localStorage.setItem("rentaryto_onboarding_completed", "true");
    onComplete();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Configuración inicial</h2>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Saltar tutorial
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-2 rounded-full ${
                  step <= currentStep ? "bg-blue-600" : "bg-gray-200"
                }`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Paso {currentStep} de 3</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <Step1Property
              onNext={handleStep1Complete}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 2 && propertyId && (
            <Step2Tenant
              propertyId={propertyId}
              onNext={handleStep2Complete}
              onBack={handleBack}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 3 && propertyId && (
            <Step3Reminders
              propertyId={propertyId}
              onComplete={handleStep3Complete}
              onBack={handleBack}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
