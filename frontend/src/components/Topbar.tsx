'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './Icon';

const titles: Record<string, string> = {
  '/dashboard': 'Visão geral',
  '/agendamentos': 'Agendamentos',
  '/pets': 'Pets',
  '/tutores': 'Tutores',
  '/profissionais': 'Profissionais',
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] ?? 'Banhosa Baso';

  function logout() {
    document.cookie = 'banhosa_auth=; path=/; max-age=0';
    router.push('/login');
  }

  return <header className="topbar"><div><div className="eyebrow">Pet care · Gestão</div><h1>{title}</h1></div><div className="topbar-actions"><button className="user-chip" onClick={logout} title="Sair"><div className="avatar">BA</div><div><strong>Banhosa.Adm</strong><small>Administrador</small></div><Icon name="chevron"/></button></div></header>;
}
