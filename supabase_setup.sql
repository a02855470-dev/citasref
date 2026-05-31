-- Configuración de Base de Datos para CITASREF

-- 1. Crear tabla de citas
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_gestion DATE DEFAULT CURRENT_DATE NOT NULL,
    servicio_destino TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    observacion TEXT
);

-- 2. Habilitar RLS (Row Level Security) para la tabla
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas públicas (como no hay auth estricto, permitimos acceso anónimo)
-- Política para insertar (Cualquier usuario anónimo puede insertar - asumimos validación en Frontend)
CREATE POLICY "Permitir inserción pública" 
    ON public.citas FOR INSERT 
    TO public
    WITH CHECK (true);

-- Política para leer (Cualquier usuario anónimo puede leer)
CREATE POLICY "Permitir lectura pública" 
    ON public.citas FOR SELECT 
    TO public
    USING (true);

-- 4. Configurar Storage (Bucket para fotos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('citas_fotos', 'citas_fotos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de Storage
-- Permitir subida pública de imágenes
CREATE POLICY "Imágenes públicas subida" 
    ON storage.objects FOR INSERT 
    TO public 
    WITH CHECK (bucket_id = 'citas_fotos');

-- Permitir lectura pública de imágenes
CREATE POLICY "Imágenes públicas lectura" 
    ON storage.objects FOR SELECT 
    TO public 
    USING (bucket_id = 'citas_fotos');

-- Permitir actualización/borrado (opcional)
CREATE POLICY "Imágenes públicas update" 
    ON storage.objects FOR UPDATE 
    TO public 
    USING (bucket_id = 'citas_fotos');

CREATE POLICY "Imágenes públicas delete" 
    ON storage.objects FOR DELETE 
    TO public 
    USING (bucket_id = 'citas_fotos');
