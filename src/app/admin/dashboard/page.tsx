
'use client';

import { PageHeader } from '@/components/page-header';

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Tableau de Bord"
        subtitle="Vue d'ensemble de votre établissement"
      />
      <div className="p-4">
        {/* Statistics cards will be added here */}
      </div>
    </div>
  );
}
