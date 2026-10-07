# KOWI Partners & Builders — Especificación de producto y negocio
Estado: definición aprobada, implementación técnica pendiente de pruebas.

## Posicionamiento
Línea transversal integrada en KOWI School y KOWI Business; no marca desconectada. Forma talento, permite crear agentes y aplicaciones, implementar soluciones para empresas y comercializar servicios. Comunidad e impacto humano como principios.

## Recorrido
School (aprendizaje, pruebas, competencias) → Community/Projects (ideas y colaboración) → Builders (prototipos, revisión de seguridad, publicación) o Partners (formación comercial, validación, captación) → Business (onboarding cliente, implementación, CRM, facturación y soporte) → reconocimiento, comisiones y reinversión educativa.

## Roles y permisos
- learner: perfil, portafolio y proyectos.
- builder: crea proyectos y solicita revisión/publicación.
- partner: gestiona leads asignados con consentimiento y registra oportunidades.
- business_owner: aprueba instalaciones, acceso a datos y comunicaciones.
- reviewer/admin: valida competencias, seguridad, atribución y pagos.
- mentor: acompaña sin acceso por defecto a datos sensibles.
Separación tenant/organización, RLS, auditoría y aprobación humana proporcional al riesgo.

## MVP funcional
1. Landing /partners-builders con dos recorridos «Quiero crear» y «Quiero comercializar».
2. Inscripción gratuita al programa y perfil de capacidades/idiomas.
3. Formación School, evaluaciones y portfolio verificable.
4. Panel Builders: proyecto, plantilla de agente, entorno sandbox, pruebas, solicitud de publicación.
5. Panel Partners: catálogo autorizado, CRM de leads con consentimiento, estado de venta y cálculo provisional de comisiones.
6. Flujo Business: cliente solicita demo → Partner prepara propuesta → cliente autoriza → Builder implementa → pruebas E2E → aceptación → factura/pago → comisión liquidable tras validación.
7. Comunidad: compartir conocimientos, detectar necesidades, cocrear, construir, probar y publicar resultados; atribución de autores y acuerdos de licencias.

## Monetización — pendiente de validación financiera y legal
- Formación Free y planes School Individual 9,90 €/mes y Pro + Builders 24,90 €/mes como precios orientativos.
- Business por plan y consumo; implantaciones profesionales por presupuesto.
- Comisión Partners por ventas efectivamente cobradas y no reembolsadas; porcentaje y calendario a aprobar, sin promesas de ganancias.
- Builders: tarifas por proyectos acordadas con cliente y, en futuro, reparto de ingresos de Marketplace bajo contrato.
- Distinguir acceso formativo a Builders de herramientas de producción con consumo facturable.

## Seguridad y marco legal
RGPD, LSSI-CE, contratos y fiscalidad de colaboradores, derechos de autor, licencias y titularidad de soluciones; consentimiento de clientes para datos y canales; no acceso a WhatsApp, email, agenda ni CRM sin autorización. KOWI no adquiere propiedad de ideas de estudiantes automáticamente. Revisión de modelo de intermediación/empleo antes de presentarlo como contratación laboral.

## Arquitectura propuesta
Next.js App Router, Supabase Auth/RLS; entidades partners_profiles, builders_profiles, skills_evidence, projects, project_contributors, leads, deals, implementations, approvals, commissions, payouts, audit_events; estados y políticas server-side, webhooks de pagos idempotentes, límites de uso de IA. Reutilizar CRM y tenants existentes en lugar de duplicar tablas.

## Aceptación
E2E learner→evaluación→builder crea demo→partner registra lead consentido→owner autoriza→implementación sandbox→aceptación→venta validada→comisión calculada (sin desembolso automático). Verificar roles, aislamiento RLS, auditoría, cancelación y móvil. No publicar claims de ingresos ni activar pagos sin revisión legal y financiera.

## Integración
Relacionar iniciativas #68 School comercial, #69 comunidad, #70 Impact Lab. Despliegue sólo tras revisión, pruebas y aprobación.
