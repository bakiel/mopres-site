const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateProductImages() {
  try {
    // Update Red Leopard Pumps
    console.log('Updating Red Leopard Pumps...');
    const { data: redLeopard, error: error1 } = await supabase
      .from('products')
      .update({ 
        images: ['Red_leopard_print_high_heels_new.png'],
        in_stock: true 
      })
      .eq('id', '13860044-d28c-4730-8a7f-0ad3189fd850');
    
    if (error1) {
      console.error('Error updating Red Leopard:', error1);
    } else {
      console.log('✓ Red Leopard Pumps updated');
    }

    // Update Brown Leopard Pumps
    console.log('Updating Brown Leopard Pumps...');
    const { data: brownLeopard, error: error2 } = await supabase
      .from('products')
      .update({ 
        images: ['Leopard_print_high_heeled_shoes_new.png'],
        in_stock: true 
      })
      .eq('id', '5f454d66-1620-4f70-81d0-e1bf42f238b2');
    
    if (error2) {
      console.error('Error updating Brown Leopard:', error2);
    } else {
      console.log('✓ Brown Leopard Pumps updated');
    }

    // Update Elevated Glam Red (the metallic red one)
    console.log('Updating Elevated Glam Red...');
    const { data: metallic, error: error3 } = await supabase
      .from('products')
      .update({ 
        images: ['Red_metallic_high_heeled_shoe.png'],
        in_stock: true,
        inventory_quantity: 3,
        sizes: ["38", "40", "41"]
      })
      .eq('id', 'b91bd713-4fc5-44c8-960a-54ec1670abff');
    
    if (error3) {
      console.error('Error updating Elevated Glam Red:', error3);
    } else {
      console.log('✓ Elevated Glam Red updated');
    }

    console.log('\nAll products updated successfully!');
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const { data: products, error: verifyError } = await supabase
      .from('products')
      .select('name, images, in_stock, inventory_quantity')
      .in('id', [
        '13860044-d28c-4730-8a7f-0ad3189fd850',
        '5f454d66-1620-4f70-81d0-e1bf42f238b2',
        'b91bd713-4fc5-44c8-960a-54ec1670abff'
      ]);
    
    if (verifyError) {
      console.error('Error verifying:', verifyError);
    } else {
      console.log('\nUpdated products:');
      products.forEach(p => {
        console.log(`- ${p.name}: ${p.images[0]} (In stock: ${p.in_stock}, Qty: ${p.inventory_quantity})`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateProductImages();
