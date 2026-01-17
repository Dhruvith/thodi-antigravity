import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Globe } from "lucide-react";
import Link from "next/link";
interface BusinessCardProps {
    business: {
        id?: string;
        name?: string;
        category?: string;
        description?: string;
        logo?: string;
        contact?: any; // keeping flexible as it comes from JSON
    };
}

export function BusinessCard({ business }: BusinessCardProps) {
    return (
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 relative">
                {business.logo && (
                    <img
                        src={business.logo}
                        alt={business.name}
                        className="absolute bottom-0 left-4 translate-y-1/2 w-16 h-16 rounded-full border-4 border-background object-cover bg-white"
                    />
                )}
                {!business.logo && (
                    <div className="absolute bottom-0 left-4 translate-y-1/2 w-16 h-16 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                        {business.name?.charAt(0)}
                    </div>
                )}
            </div>
            <CardHeader className="pt-10 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold">{business.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30">
                            {business.category}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2.5">
                <p className="line-clamp-2">{business.description}</p>

                <div className="flex items-center gap-2 text-xs pt-2 border-t mt-2">
                    {business.contact?.address && (
                        <div className="flex items-center gap-1" title={business.contact.address}>
                            <MapPin className="h-3.5 w-3.5 text-accent" />
                            <span className="truncate max-w-[150px]">{business.contact.address}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-3 flex justify-between items-center text-xs font-medium">
                {business.contact?.phone && (
                    <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {business.contact.phone}
                    </div>
                )}
                {business.contact?.website && (
                    <Link href={business.contact.website} target="_blank" className="flex items-center gap-1.5 text-primary hover:underline">
                        <Globe className="h-3.5 w-3.5" /> Visit
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}
