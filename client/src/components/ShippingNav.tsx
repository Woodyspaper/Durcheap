import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { Link } from "wouter";

export function ShippingNav() {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/shipping">
        <Truck className="mr-2 h-4 w-4" />
        Shipping Tools
      </Link>
    </Button>
  );
}