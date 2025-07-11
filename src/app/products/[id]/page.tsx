
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types';
import type { Metadata, ResolvingMetadata } from 'next';
import { ProductDetailPageClient } from '@/components/pages/ProductDetailPageClient';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const product = productSnap.data() as Product;
      const title = `${product.condition} ${product.brand} ${product.model} | Classic-Solution`;
      // Truncate description for meta
      const description = product.description.length > 155 
        ? product.description.substring(0, 152) + '...' 
        : product.description;

      return {
        title: title,
        description: `Get the best deal on a ${product.condition} ${product.brand} ${product.model}. Features: ${product.features || 'N/A'}. ${description}`,
        openGraph: {
          images: product.imageUrls ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []),
        },
      }
    }
  } catch (error) {
    // Return default metadata if fetch fails
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    }
  }

  // Fallback metadata
  return {
    title: 'AC Product Details',
    description: 'Find details about our quality AC units.',
  }
}


export default function ProductDetailPage({ params }: { params: { id: string }}) {
  return <ProductDetailPageClient productId={params.id} />;
}
