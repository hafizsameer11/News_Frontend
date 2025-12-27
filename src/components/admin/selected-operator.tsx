"use client";

import { ChatUser } from "@/types/chat.types";

interface SelectedOperatorProps {
  operator: ChatUser | null;
}

export function SelectedOperator({ operator }: SelectedOperatorProps) {
  if (!operator) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-2">Selected Operator</h3>
        <p className="text-sm text-gray-500">No operator selected</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="font-bold text-gray-700 mb-2">Selected Operator</h3>
      <div className="flex items-center gap-3 mb-2">
        {operator.avatar ? (
          <img
            src={operator.avatar}
            alt={operator.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
            {operator.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{operator.name}</p>
          <p className="text-xs text-gray-500">{operator.role}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">Status: OFFLINE</p>
      <p className="text-xs text-gray-500 mt-2">
        You can send a quick chat message or assign a memo.
      </p>
    </div>
  );
}


