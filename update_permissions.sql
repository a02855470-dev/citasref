-- Script para habilitar Edición y Borrado de Citas
-- Pegar en el SQL Editor de Supabase y ejecutar.

-- 1. Eliminar políticas antiguas (si las hubiera, para evitar error de que ya existen)
DROP POLICY IF EXISTS "Permitir actualización pública" ON public.citas;
DROP POLICY IF EXISTS "Permitir borrado público" ON public.citas;

-- 2. Crear Política para Actualizar (UPDATE)
CREATE POLICY "Permitir actualización pública" 
    ON public.citas FOR UPDATE 
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. Crear Política para Borrar (DELETE)
CREATE POLICY "Permitir borrado público" 
    ON public.citas FOR DELETE 
    TO public
    USING (true);
