"use client";

import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { DetailsStep } from "./wizard-steps/details-step";
import { CreativeStep } from "./wizard-steps/creative-step";
import { PlacementStep } from "./wizard-steps/placement-step";
import { PaymentStep } from "./wizard-steps/payment-step";
import { CreateAdInput } from "@/types/ads.types";

interface AdCreationWizardProps {
  onComplete?: (adId: string) => void;
  onCancel?: () => void;
}

export interface WizardFormData {
  // Step 1: Details
  title: string;
  type: CreateAdInput["type"];
  targetLink: string;
  
  // Step 2: Creative
  imageUrl: string;
  
  // Step 3: Placement & Schedule
  position?: string;
  startDate: string;
  endDate: string;
  
  // Step 4: Payment (handled separately)
}

export function AdCreationWizard({ onComplete, onCancel }: AdCreationWizardProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [formData, setFormData] = useState<WizardFormData>({
    title: "",
    type: "BANNER_TOP",
    targetLink: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
  });
  const [stepErrors, setStepErrors] = useState<Record<number, Record<string, string>>>({});

  const totalSteps = 4;

  // Check if form has any data
  const hasFormData = formData.title.trim() || 
                     formData.targetLink.trim() || 
                     formData.imageUrl.trim() || 
                     formData.startDate || 
                     formData.endDate;

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const setStepError = (step: number, errors: Record<string, string>) => {
    setStepErrors((prev) => ({ ...prev, [step]: errors }));
  };

  const getStepErrors = (step: number): Record<string, string> => {
    return stepErrors[step] || {};
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        errors.title = language === "it" ? "Titolo richiesto" : "Title is required";
      }
      if (!formData.targetLink.trim()) {
        errors.targetLink = language === "it" ? "Link di destinazione richiesto" : "Target link is required";
      } else if (!/^https?:\/\/.+/.test(formData.targetLink)) {
        errors.targetLink = language === "it" ? "URL non valido" : "Invalid URL";
      }
    } else if (step === 2) {
      if (!formData.imageUrl.trim()) {
        errors.imageUrl = language === "it" ? "Immagine richiesta" : "Image is required";
      } else if (!/^https?:\/\/.+/.test(formData.imageUrl)) {
        errors.imageUrl = language === "it" ? "URL non valido" : "Invalid URL";
      }
    } else if (step === 3) {
      if (!formData.startDate) {
        errors.startDate = language === "it" ? "Data di inizio richiesta" : "Start date is required";
      }
      if (!formData.endDate) {
        errors.endDate = language === "it" ? "Data di fine richiesta" : "End date is required";
      }
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (start >= end) {
          errors.endDate = language === "it" 
            ? "La data di fine deve essere successiva alla data di inizio" 
            : "End date must be after start date";
        }
      }
    }

    setStepError(step, errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (hasFormData) {
      setShowCancelConfirm(true);
    } else {
      onCancel?.();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel?.();
  };

  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleStepComplete = (adId: string) => {
    onComplete?.(adId);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DetailsStep
            formData={formData}
            updateFormData={updateFormData}
            errors={getStepErrors(1)}
          />
        );
      case 2:
        return (
          <CreativeStep
            formData={formData}
            updateFormData={updateFormData}
            errors={getStepErrors(2)}
          />
        );
      case 3:
        return (
          <PlacementStep
            formData={formData}
            updateFormData={updateFormData}
            errors={getStepErrors(3)}
          />
        );
      case 4:
        return (
          <PaymentStep
            formData={formData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const getStepLabel = (step: number): string => {
    const labels = {
      1: language === "it" ? "Dettagli" : "Details",
      2: language === "it" ? "Creativo" : "Creative",
      3: language === "it" ? "Posizionamento" : "Placement",
      4: language === "it" ? "Pagamento" : "Payment",
    };
    return labels[step as keyof typeof labels] || "";
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Progress Indicator */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === "it" ? "Crea Nuovo Annuncio" : "Create New Ad"}
          </h2>
          <span className="text-sm text-gray-600">
            {language === "it" ? "Passo" : "Step"} {currentStep} {language === "it" ? "di" : "of"} {totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    isCompleted
                      ? "bg-green-500"
                      : isActive
                      ? "bg-red-600"
                      : "bg-gray-200"
                  }`}
                />
                {step < totalSteps && (
                  <div
                    className={`w-2 h-2 rounded-full mx-1 ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? "bg-red-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <button
                key={step}
                onClick={() => handleStepClick(step)}
                disabled={!isCompleted && !isActive}
                className={`text-xs font-medium transition ${
                  isActive
                    ? "text-red-600"
                    : isCompleted
                    ? "text-green-600 hover:text-green-700 cursor-pointer"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                {getStepLabel(step)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 4 && (
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                {language === "it" ? "Indietro" : "Back"}
              </button>
            )}
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              {language === "it" ? "Annulla" : "Cancel"}
            </button>
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            {language === "it" ? "Avanti" : "Next"}
          </button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === "it" ? "Conferma Annullamento" : "Confirm Cancellation"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "it"
                ? "Sei sicuro di voler annullare? Tutti i dati inseriti andranno persi."
                : "Are you sure you want to cancel? All entered data will be lost."}
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                {language === "it" ? "Continua" : "Continue"}
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                {language === "it" ? "Annulla" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

