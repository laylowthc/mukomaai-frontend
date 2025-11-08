import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const categories = [
    { name: 'Business Tools', icon: 'briefcase', imageId: 'market-business' },
    { name: 'Creative Assets', icon: 'palette', imageId: 'market-creative' },
    { name: 'Productivity Hacks', icon: 'zap', imageId: 'market-productivity' },
    { name: 'Educational Content', icon: 'book-open', imageId: 'market-education' },
];

const items = [
    { name: 'AI Logo Generator', category: 'Creative Assets', price: '$10', imageId: 'item-logo' },
    { name: 'Business Plan Creator', category: 'Business Tools', price: '$25', imageId: 'item-plan' },
    { name: 'Focus Music Playlist', category: 'Productivity Hacks', price: '$5', imageId: 'item-music' },
    { name: 'Shona Language Course', category: 'Educational Content', price: '$50', imageId: 'item-course' },
    { name: 'Social Media Post Writer', category: 'Creative Assets', price: '$15', imageId: 'item-social' },
    { name: 'Market Analysis Bot', category: 'Business Tools', price: '$75', imageId: 'item-analysis' },
];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export default function MarketPage() {
    return (
        <main className="flex h-full flex-col">
             <header className="flex h-16 items-center border-b bg-secondary/50 px-6 shrink-0">
                <h1 className="text-xl font-semibold font-headline">Marketplace</h1>
            </header>
            <div className="flex-1 overflow-auto p-6">
                <div className="mb-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-3xl font-bold font-headline">Coming Soon</h2>
                    <p className="mt-2 text-muted-foreground">A marketplace of digital services powered by MukomaAI.</p>
                </div>

                <div className="mb-12">
                    <h3 className="mb-6 text-2xl font-semibold font-headline">Categories</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((category) => {
                             const image = getImage(category.imageId);
                             return(
                            <Card key={category.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-40 w-full">
                                    {image && <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />}
                                    <div className="absolute inset-0 bg-black/40" />
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="text-lg font-semibold">{category.name}</h4>
                                </CardContent>
                            </Card>
                        )})}
                    </div>
                </div>

                <div>
                    <h3 className="mb-6 text-2xl font-semibold font-headline">Featured Items</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => {
                             const image = getImage(item.imageId);
                             return (
                            <Card key={item.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="p-0">
                                    <div className="relative h-48 w-full">
                                        {image && <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{item.category}</p>
                                    <p className="mt-2 text-lg font-bold text-primary">{item.price}</p>
                                </CardContent>
                            </Card>
                        )})}
                    </div>
                </div>
            </div>
        </main>
    )
}
