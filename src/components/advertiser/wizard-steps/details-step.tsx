"use client";

import { WizardFormData } from "../ad-creation-wizard";

interface DetailsStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const AD_TYPES = [
  { value: "BANNER_TOP", label: "Banner Top", labelIt: "Banner Superiore" },
  { value: "BANNER_SIDE", label: "Banner Side", labelIt: "Banner Laterale" },
  { value: "INLINE", label: "Inline", labelIt: "In Linea" },
  { value: "FOOTER", label: "Footer", labelIt: "Piè di Pagina" },
  { value: "SLIDER", label: "Slider", labelIt: "Slider" },
  { value: "TICKER", label: "Ticker", labelIt: "Ticker" },
  { value: "POPUP", label: "Popup", labelIt: "Popup" },
  { value: "STICKY", label: "Sticky", labelIt: "Fisso" },
];

export function DetailsStep({ formData, updateFormData, errors }: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ad Details
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Enter the basic information for your advertisement.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Ad Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          className={`w-full px-3 py-2 border ${
            errors.title ? "border-red-300" : "border-gray-300"
          } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
          placeholder="Enter ad title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Ad Type *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => updateFormData({ type: e.target.value as WizardFormData["type"] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          {AD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Select the type of advertisement you want to create.
        </p>
      </div>

      <div>
        <label htmlFor="targetLink" className="block text-sm font-medium text-gray-700 mb-1">
          Target Link *
        </label>
        <input
          id="targetLink"
          type="url"
          value={formData.targetLink}
          onChange={(e) => updateFormData({ targetLink: e.target.value })}
          className={`w-full px-3 py-2 border ${
            errors.targetLink ? "border-red-300" : "border-gray-300"
          } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
          placeholder="https://example.com"
        />
        {errors.targetLink && <p className="mt-1 text-sm text-red-600">{errors.targetLink}</p>}
        <p className="mt-1 text-xs text-gray-500">
          The URL where users will be redirected when they click on your ad.
        </p>
      </div>
    </div>
  );
}

