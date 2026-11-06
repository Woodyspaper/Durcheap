import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category & { subcategories?: Category[] };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/search?category=${category.id}`}>
        <div className="relative">
          <img
            src={category.imageUrl || "/placeholder-category.jpg"}
            alt={category.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white text-xl font-semibold mb-1">{category.name}</h3>
            <p className="text-white text-sm opacity-90">{category.description}</p>
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {category.subcategories.slice(0, 3).map((sub) => (
                  <Badge key={sub.id} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    {sub.name}
                  </Badge>
                ))}
                {category.subcategories.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    +{category.subcategories.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}