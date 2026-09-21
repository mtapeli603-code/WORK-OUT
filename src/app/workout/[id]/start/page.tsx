import { WorkoutPlayer } from "@/components/workout-player";

export default async function ActiveWorkoutPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <WorkoutPlayer workoutSlug={id} />; }
