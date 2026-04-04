# API Routes

Esta carpeta contiene todas las rutas de API migradas desde Express.

## Estructura

- `/apartments` - CRUD de inmuebles
- `/tenants` - CRUD de inquilinos
- `/documents` - Upload y gestión de documentos
- `/reminders` - Gestión de recordatorios
- `/recurring-expenses` - Gastos recurrentes
- `/unexpected-expenses` - Gastos inesperados
- `/dashboard` - Datos del dashboard
- `/tax-report/[year]` - Informes fiscales por año

## Autenticación

Todas las rutas requieren autenticación con Supabase Auth.
Usar `requireAuth(request)` para validar usuario.

## Patrón de conversión

**Antes (Express):**
```typescript
router.get("/", authenticate, async (req, res) => {
  const data = await prisma.model.findMany({
    where: { userId: req.userId }
  });
  res.json(data);
});
```

**Después (Next.js API Route):**
```typescript
export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await prisma.model.findMany({
    where: { userId: user.id }
  });
  
  return NextResponse.json(data);
}
```

## Pendiente de migración

Las rutas se migrarán cuando se configuren las credenciales de Supabase.
