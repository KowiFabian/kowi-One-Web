import AuthGate from '@/components/AuthGate';
import KowiStart from '@/components/KowiStart';

export default function KowiPage() {
  return <AuthGate guestIntro={<KowiStart />} />;
}
