import Image from "next/image";
import { memo } from "react";

type Product = {
  id: number;
  name: string;
  available: number;
  price: number;
  image: string;
  category: string;
};

type ProductsGridProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

function ProductsGridComponent({ products, onAddToCart }: ProductsGridProps) {
  return (
    <section className="mt-10">
      <h2 className="font-semibold text-2xl mb-3">Select Menu</h2>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="cv-auto border border-gray-300 rounded-xl p-4 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Image
                src={product.image}
                height={50}
                width={50}
                alt={product.name}
                className="rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  {product.available} Available
                </p>
                <p className="text-orange-600 font-semibold">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <button
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition"
              onClick={() => onAddToCart(product)}
            >
              Add To Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export const ProductsGrid = memo(ProductsGridComponent);
