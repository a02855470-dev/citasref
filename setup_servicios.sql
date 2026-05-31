-- 1. Crear tabla de servicios
CREATE TABLE IF NOT EXISTS public.servicios (
    nombre TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insertar servicios base (ignorando si ya existen)
INSERT INTO public.servicios (nombre) VALUES
('Cardiología'), ('Neurología'), ('Traumatología'), ('Gastroenterología'),
('Neumología'), ('Endocrinología'), ('Reumatología'), ('Oftalmología')
ON CONFLICT (nombre) DO NOTHING;

-- Si hay servicios que creaste probando, los metemos para que no explote
INSERT INTO public.servicios (nombre)
SELECT DISTINCT servicio_destino FROM public.citas
WHERE servicio_destino NOT IN (SELECT nombre FROM public.servicios)
ON CONFLICT (nombre) DO NOTHING;

-- 3. Vincular la tabla citas con servicios para borrado en cascada
ALTER TABLE public.citas
DROP CONSTRAINT IF EXISTS fk_servicio;

ALTER TABLE public.citas
ADD CONSTRAINT fk_servicio
FOREIGN KEY (servicio_destino) 
REFERENCES public.servicios (nombre) 
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 4. Habilitar RLS
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

-- 5. Políticas públicas para servicios
DROP POLICY IF EXISTS "Lectura publica servicios" ON public.servicios;
DROP POLICY IF EXISTS "Escritura publica servicios" ON public.servicios;
DROP POLICY IF EXISTS "Actualizacion publica servicios" ON public.servicios;
DROP POLICY IF EXISTS "Borrado publico servicios" ON public.servicios;

CREATE POLICY "Lectura publica servicios" ON public.servicios FOR SELECT TO public USING (true);
CREATE POLICY "Escritura publica servicios" ON public.servicios FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Actualizacion publica servicios" ON public.servicios FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Borrado publico servicios" ON public.servicios FOR DELETE TO public USING (true);
