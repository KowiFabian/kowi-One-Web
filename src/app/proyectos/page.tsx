import Link from 'next/link';
import type { Metadata } from 'next';
import ProjectsWorkspace from '@/components/ProjectsWorkspace';

export const metadata: Metadata = {
  title: 'Kowi Proyectos | De la idea a la acción',
  description: 'Organiza ideas, objetivos, fases y próximas acciones en tu espacio de proyectos Kowi.',
};

export default function ProjectsPage() {
  return <main className="kowi-shell min-h-screen px-6 py-12 text-[#eef8ef]">
    <div className="mx-auto max-w-6xl">
      <nav className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <Link href="/" className="text-[#e8b37b]">← KOWI</Link>
        <Link href="/kowi" className="rounded-full border border-white/20 px-4 py-2 text-[#d7e9dc]">Conversar con Kowi One ↗</Link>
      </nav>
      <div className="my-12 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e8b37b]">KOWI PROYECTOS</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] md:text-5xl">De una idea a la siguiente acción.</h1>
        <p className="mt-5 leading-relaxed text-[#a9c1b3]">Construye un proyecto a tu ritmo: define el resultado que buscas, traza fases y tareas, y deja clara la próxima acción. Puedes preparar un plan con Kowi One y traerlo aquí para revisarlo antes de guardarlo.</p>
      </div>
      <ProjectsWorkspace />
    </div>
  </main>;
}
