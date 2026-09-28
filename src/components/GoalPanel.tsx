'use client';
import React from 'react';
import { ConversationState } from '@/types';

interface GoalPanelProps { goal: ConversationState; onNewConversation: () => void; }

export default function GoalPanel({ goal, onNewConversation }: GoalPanelProps) {
  return <div className="space-y-4">
    {goal.goal && <section className="glass rounded-[1.4rem] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d7f2a7]">Objetivo</p>
      <p className="mt-3 text-sm leading-relaxed text-[#e4f0e7]">{goal.goal}</p>
    </section>}
    {goal.first_action && <section className="rounded-[1.4rem] border border-[#d7f2a7]/20 bg-[#d7f2a7]/10 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d7f2a7]">Primera acción</p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-[#f1f8ec]">{goal.first_action}</p>
      <p className="mt-3 text-xs text-[#9fb6a7]">Empieza por aquí. Puedes volver y ajustar el plan.</p>
    </section>}
    {goal.plan && goal.plan.length > 0 && <section className="glass rounded-[1.4rem] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d7f2a7]">Plan de 30 días</p>
      <div className="mt-4 space-y-4">{goal.plan.map((week, idx) => <div key={idx} className="border-l border-[#d7f2a7]/30 pl-4">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7fa690]">Bloque {idx + 1}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#c9dbcf]">{week}</p>
      </div>)}</div>
    </section>}
    <button onClick={onNewConversation} className="w-full rounded-full border border-white/10 px-4 py-3 text-sm text-[#c0d2c6] hover:bg-white/5">Nueva intención</button>
  </div>;
}
