@AGENTS.md
Proyecto: Sistema de Gestión de Iglesias

Plataforma para administrar una red jerárquica de iglesias (madre/hija), personas, grupos pequeños, finanzas y roles con control de acceso.

Stack
Frontend: Next.js 15 (App Router) + TypeScript + Tailwind
Backend/DB: Supabase (Postgres + Auth + RLS + Storage)
Package manager: pnpm
Deploy: Vercel (frontend) + Supabase Cloud (DB)
Comandos
Dev: pnpm dev
Build: pnpm build
Lint: pnpm lint
Typecheck: pnpm typecheck
Test: pnpm test
Supabase local: supabase start / supabase stop
Nueva migración: supabase migration new <nombre>
Aplicar migraciones (local): supabase db reset
Aplicar migraciones (remoto): supabase db push
Generar tipos TS desde la DB: pnpm supabase gen types typescript --local > src/types/database.ts
Arquitectura
Estructura por features en /src/features/{auth,churches,people,groups,finance}, cada una con components/, services/, types.ts.
La lógica de negocio vive en services/, NUNCA en componentes ni en API routes.
Todo acceso a datos pasa por el cliente Supabase tipado en src/lib/supabase.
La jerarquía de iglesias es un árbol auto-referenciado (churches.parent_church_id). Para obtener descendientes, usar SIEMPRE la función SQL get_church_descendants(), nunca recursión manual en el cliente.
La geografía (país/región/distrito/zona) es independiente de la jerarquía organizacional (madre/hija). No confundir ambos árboles.
Seguridad — reglas duras, sin excepción
Toda tabla con datos de personas o dinero DEBE tener RLS habilitado en la MISMA migración que la crea. No se aprueba una migración sin sus políticas.
La autorización se resuelve en la base de datos (RLS + user_roles.scope_church_id), nunca solo con checks de UI. Un check de UI es UX, no seguridad.
La service_role key de Supabase NUNCA se usa en código de cliente. Solo en server actions / route handlers, y solo cuando RLS no pueda expresar la regla.
Cambios de esquema siempre van en /supabase/migrations. Nunca editar el schema a mano en el dashboard de producción.
Toda edición o borrado de registros en financial_entries debe quedar registrada en audit_log.
Reglas de trabajo
Correr lint y typecheck antes de dar una tarea por terminada.
Para cambios que tocan RLS o roles: escribir y correr un test que verifique tanto el caso permitido como el caso denegado antes de mergear.
Commits siguen Conventional Commits (feat:, fix:, refactor:, chore:...).
Nunca hacer push directo a main; todo cambio vía PR.
Modelo de datos (resumen — ver supabase/migrations para el detalle)
countries → regions → districts → zones: jerarquía geográfica.
churches: jerarquía organizacional propia (parent_church_id), referencia opcional a zone_id.
people: church_id nullable (una persona puede asistir solo a un grupo, sin iglesia casa). Estado: visitor → new → in_process → member → leader.
process_steps + person_process_progress: escalera de proceso por persona.
groups + group_members: grupos pequeños, N:N con personas.
financial_entries: ingresos por servicio de iglesia o por grupo (group_id opcional).
roles, permissions, role_permissions, user_roles: RBAC con scope_church_id (un rol aplica a una iglesia y a todas sus descendientes).
Orden de implementación (no construir fuera de este orden)
Auth + roles/permisos (todo lo demás depende de poder proteger datos)
Jerarquía de iglesias (geografía + árbol organizacional)
Personas + escalera de proceso
Grupos pequeños
Finanzas (va último: necesita RLS ya probado en capas anteriores)
Dashboards y reportes