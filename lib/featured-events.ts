export type FeaturedEvent = {
  id: string;
  title: string;
  artist: string;
  date: string;
  zone: string;
  description: string;
  image: string;
  artistUrl: string;
};

export const featuredEvents: FeaturedEvent[] = [
  {
    id: "jazz-nights",
    title: "Jazz Nights",
    artist: "John Coltrane",
    image: "/images/events/john-coltrane.jpg",
    artistUrl: "https://open.spotify.com/intl-es/track/7b9GTuHH5QPglZrKQATW8Q",
    date: "25 MAY",
    zone: "Pista principal",
    description: "Una noche de jazz clásico y atmósfera elegante."
  },
  {
    id: "latin-urban-night",
    title: "Latin Urban Night",
    artist: "Arcángel",
    image: "/images/events/arcangel.jpg",
    artistUrl: "https://open.spotify.com/intl-es/artist/4SsVbpTthjScTS7U2hmr1X",
    date: "31 MAY",
    zone: "Escenario live",
    description: "Ritmos urbanos latinos con ambiente premium."
  },
  {
    id: "reggaeton-classics",
    title: "Reggaeton Classics",
    artist: "Ñejo",
    image: "/images/events/nejo.jpg",
    artistUrl: "https://open.spotify.com/intl-es/artist/2OHKEe204spO7G7NcbeO2o",
    date: "07 JUN",
    zone: "Pista principal",
    description: "Una sesión de clásicos urbanos para cantar toda la noche."
  }
];

export function getFeaturedEvent(eventId: string) {
  return featuredEvents.find((event) => event.id === eventId);
}
