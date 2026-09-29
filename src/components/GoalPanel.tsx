'use client';
import React from 'react';
import Link from 'next/link';
import { ConversationState } from '@/types';

interface GoalPanelProps { goal: ConversationState; onNewConversation: () => void; }

export default function GoalPanel({ goal, onNewConversation }: GoalPanelProps) {
  function prepareProject() {
    try {
      sessionStorage.setItem('kowi-project-draft', JSON.stringify({
        idea: goal.intent.slice(0, 2000), objective: goal.goal.slice(0, 1000),
        phases: goal.plan.map(item => item.slice(0, 500)).join('\n'),
        tasks: '', next_action: goal.first_action.slice(0, 500),
      }));
    } catch { /* The plan remains visible here if storage is disabled. */ }
  }
  return <div className="space-y-4">
    {goal.goal && <section className="glass rounded-[1.4rem] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e8b37b]">Objetivo</p>
      <p className="mt-3 text-sm leading-relaxed text-[#e4f0e7]">{goal.goal}</p>
    </section>}
    {goal.first_action && <section className="rounded-[1.4rem] border border-[#e8b37b]/20 bg-[#e8b37b]/10 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e8b37b]">Primera acción</p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-[#f1f8ec]">{goal.first_action}</p>
      <p className="mt-3 text-xs text-[#9fb6a7]">Empieza por aquí. Puedes volver y ajustar el plan.</p>
    </section>}
    {goal.plan && goal.plan.length > 0 && <section className="glass rounded-[1.4rem] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e8b37b]">Plan de 30 días</p>
      <div className="mt-4 space-y-4">{goal.plan.map((week, idx) => <div key={idx} className="border-l border-[#e8b37b]/30 pl-4">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7fa690]">Bloque {idx + 1}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#c9dbcf]">{week}</p>
      </div>)}</div>
    </section>}
    {goal.goal && goal.first_action && <Link href="/proyectos" onClick={prepareProject} className="block w-full rounded-full bg-[#e8b37b] px-4 py-3 text-center text-sm font-semibold text-[#17121a]">Convertir en proyecto ↗</Link>}
    <button onClick={onNewConversation} className="w-full rounded-full border border-white/10 px-4 py-3 text-sm text-[#c0d2c6] hover:bg-white/5">Nueva intención</button>
  </div>;
}
