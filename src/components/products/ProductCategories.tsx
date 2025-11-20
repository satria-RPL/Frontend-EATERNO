import Image from "next/image";

type Category = {
  id: string;
  label: string;
  icon: string;
};

type ProductCategoriesProps = {
  categories: Category[];
  activeCategory: Category["id"];
  onSelectCategory: (id: Category["id"]) => void;
};

export function ProductCategories({
  categories,
  activeCategory,
  onSelectCategory,
}: ProductCategoriesProps) {
  return (
    <section className="mt-10">
      <h2 className="font-semibold text-2xl mb-3">Categories</h2>
      <div className="flex gap-3">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`rounded-xl border flex flex-col justify-between items-center gap-2 px-4 py-2 w-24 transition-all
                ${
                  isActive
                    ? "border-orange-500 bg-orange-100"
                    : "border-gray-400 bg-white"
                }`}
            >
              <Image
                src={category.icon}
                width={20}
                height={20}
                alt={category.label}
              />
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-orange-600" : "text-gray-600"
                }`}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
