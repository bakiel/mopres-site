-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_sizes table
CREATE TABLE IF NOT EXISTS public.product_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- Add indexes for performance
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_display_order ON public.product_images(display_order);
CREATE INDEX idx_product_sizes_product_id ON public.product_sizes(product_id);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_images
CREATE POLICY "Public can view product images" ON public.product_images
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Admins can manage product images" ON public.product_images
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.app_metadata->>'role' = 'admin' OR auth.users.user_metadata->>'role' = 'admin')
        )
    );

-- RLS policies for product_sizes
CREATE POLICY "Public can view product sizes" ON public.product_sizes
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Admins can manage product sizes" ON public.product_sizes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.app_metadata->>'role' = 'admin' OR auth.users.user_metadata->>'role' = 'admin')
        )
    );

-- Add triggers to update the updated_at timestamp
CREATE TRIGGER update_product_images_updated_at 
    BEFORE UPDATE ON public.product_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sizes_updated_at 
    BEFORE UPDATE ON public.product_sizes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();