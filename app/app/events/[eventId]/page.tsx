import { EventDetailClient } from "./EventDetailClient";

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;
  return <EventDetailClient eventId={eventId} />;
}
