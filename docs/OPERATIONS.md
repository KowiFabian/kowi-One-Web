# Operación del piloto KOWI

1. Revisa [alcance y límites](PUBLIC-PLATFORM.md), [privacidad](SECURITY-PRIVACY.md) y `.env.example`.
2. Usa Supabase Auth Email OTP con una plantilla que muestre el código numérico y SMTP configurado. Valida el alta con un buzón propio antes de invitar clientes.
3. Aplica migraciones en orden en un proyecto nuevo. En el proyecto conectado ya constan `kowi_core`, `education_agent`, `business_agent`, `business_agent_channels_approvals`, `business_agent_fk_indexes`, `public_platform` y `action_approval_guard`.
4. Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `OPENAI_API_KEY` en Vercel sin imprimir ni registrar valores. La clave OpenAI siempre es de servidor.
5. Mantén `KOWI_VERIFIED_CHANNELS` vacío hasta confirmar credenciales, permisos, webhook y prueba de ida y vuelta para cada canal. Zoho Mail es recepción corporativa externa; Resend solo prepara salida transaccional.
6. Ejecuta `npm ci`, `npm test`, `npm run type-check`, `npm run lint`, `npm run build` y comprueba con dos cuentas que no hay acceso cruzado.
7. Vercel protege actualmente `vercel.app` con SSO. Para un piloto público, configurar un dominio personalizado accesible o cambiar Deployment Protection en el proyecto. Comprobar allí OTP, chat y persistencia antes de promover la rama a producción.
8. Completar identidad del responsable, bases jurídicas, conservación y derechos en el aviso legal antes de recoger datos personales reales de clientes finales.

La rama de este piloto no envía mensajes automáticamente. Las acciones externas exigen consentimiento del contacto, aprobación explícita del propietario y canal verificado. Un token de proveedor presente no equivale a canal activo.
