'use client';

import React from 'react';
import { ConversationState } from '@/types';

interface GoalPanelProps {
  goal: ConversationState;
  onNewConversation: () => void;
}

const GoalPanel: React.FC<GoalPanelProps> = ({ goal, onNewConversation }) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
      <div className="sticky top-0 bg-primary text-white px-6 py-4">
        <h2 className="font-bold text-lg">Tu Plan</h2>
        <p className="text-xs text-blue-100 mt-1">30 días para lograrlo</p>
      </div>

      <div className="p-6 space-y-6">
        {goal.goal && (
          <div>
            <h3 className="font-bold text-primary mb-2">Objetivo</h3>
            <p className="text-sm text-gray-900">{goal.goal}</p>
          </div>
        )}

        {goal.first_action && (
          <div>
            <h3 className="font-bold text-accent mb-2">Primer Paso</h3>
            <p className="text-sm text-gray-900">{goal.first_action}</p>
            <p className="text-xs text-gray-500 mt-2 italic">
              Comienza hoy mismo
            </p>
          </div>
        )}

        {goal.plan && goal.plan.length > 0 && (
          <div>
            <h3 className="font-bold text-primary mb-3">Plan de 30 Días</h3>
            <div className="space-y-3">
              {goal.plan.map((week, idx) => (
                <div key={idx} className="border-l-2 border-accent pl-3">
                  <p className="text-xs font-semibold text-accent">
                    Semana {idx + 1}
                  </p>
                  <p className="text-sm text-gray-900 mt-1">{week}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onNewConversation}
          className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Nueva Conversación
        </button>
      </div>
    </div>
  );
};

export default GoalPanel;