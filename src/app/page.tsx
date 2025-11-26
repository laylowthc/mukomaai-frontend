import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MessageSquare, Languages, Users, Bot, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const featurePillImage = PlaceHolderImages.find(img => img.id === 'feature-pill');
const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'Persona-Based Chat',
    description: 'Engage with AI characters like Mukoma, Tateguru, and more for a unique conversational experience.',
  },
  {
    icon: <Languages className="h-8 w-8 text-primary" />,
    title: 'Shona-First',
    description: 'Natively fluent in Shona, English, and Ndebele, MukomaAI understands you perfectly.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'Chat History',
    description: 'All your conversations are saved, so you can pick up right where you left off.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'User Profiles',
    description: 'Personalize your experience with custom settings for theme, language, and default persona.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">MukomaAI</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
              Your Shona-First AI Assistant
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              Experience the future of conversation with MukomaAI. Chat with unique AI personas, in your language, your way.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth">Start Chatting Now</Link>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
           <div className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>
        </section>


        <section className="bg-secondary py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold font-headline">Powerful Features, Simple Interface</h3>
              <p className="mt-4 text-muted-foreground">
                Everything you need for a seamless and personalized AI experience.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card text-card-foreground text-center p-8 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold font-headline">{feature.title}</h4>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold font-headline">Ready for the Marketplace?</h3>
              <p className="mt-4 text-lg text-muted-foreground">
                Soon, you'll be able to access a curated marketplace of digital services directly within MukomaAI. Stay tuned for tools and services that understand your needs.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/market"><ShoppingCart className="mr-2" /> Explore Marketplace</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              {featurePillImage && (
                <Image
                  src={featurePillImage.imageUrl}
                  alt={featurePillImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={featurePillImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MukomaAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
