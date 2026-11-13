import type {Metadata} from 'next';
import Link from 'next/link';
import UnitEconomics from '@/components/UnitEconomics';
export const metadata:Metadata={title:'KOWI · Simulador interno de rentabilidad',robots:{index:false,follow:false}};
export default function Page(){return <main className="min-h-screen bg-[#f7faf9] text-[#142a27]"><header className="mx-auto max-w-6xl px-5 py-6"><Link href="/studio" className="font-semibold text-[#087e75]">← KOWI AI Studio</Link></header><UnitEconomics/></main>}