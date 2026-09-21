import { PrismaClient, Difficulty, ExerciseType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const exerciseData = [
  ["Barbell bench press", "barbell-bench-press", "Chest", "Full gym", Difficulty.INTERMEDIATE],
  ["Goblet squat", "goblet-squat", "Legs", "Home equipment", Difficulty.BEGINNER],
  ["Lat pulldown", "lat-pulldown", "Back", "Full gym", Difficulty.BEGINNER],
  ["Romanian deadlift", "romanian-deadlift", "Glutes", "Full gym", Difficulty.INTERMEDIATE],
  ["Dumbbell shoulder press", "dumbbell-shoulder-press", "Shoulders", "Home equipment", Difficulty.BEGINNER],
  ["Plank shoulder tap", "plank-shoulder-tap", "Core", "No equipment", Difficulty.BEGINNER],
  ["Walking lunge", "walking-lunge", "Legs", "No equipment", Difficulty.BEGINNER],
  ["Face pull", "face-pull", "Shoulders", "Full gym", Difficulty.INTERMEDIATE],
] as const;

async function main() {
  const passwordHash = await bcrypt.hash("form-demo-password", 12);
  const demoUser = await prisma.user.upsert({ where: { email: "alex@form.training" }, update: {}, create: { email: "alex@form.training", name: "Alex Morgan", passwordHash, profile: { create: { fitnessLevel: Difficulty.INTERMEDIATE, primaryGoal: "Build strength", workoutFrequency: 4, preferredDuration: 45, equipment: "Full gym", onboardingDone: true } }, preferences: { create: { reminderEnabled: true, reminderTime: "07:00", reminderDays: "MON,WED,THU,SAT" } } } });
  await prisma.user.upsert({ where: { email: "admin@form.training" }, update: { role: "ADMIN" }, create: { email: "admin@form.training", name: "FORM Admin", passwordHash, role: "ADMIN", profile: { create: { onboardingDone: true } }, preferences: { create: {} } } });
  const exerciseIds: Record<string, string> = {};
  for (const [name, slug, primaryMuscle, equipment, difficulty] of exerciseData) { const exercise = await prisma.exercise.upsert({ where: { slug }, update: {}, create: { name, slug, primaryMuscle, equipment, difficulty, type: name.includes("Plank") ? ExerciseType.BODYWEIGHT : ExerciseType.STRENGTH, description: `${name} is a focused ${primaryMuscle.toLowerCase()} movement.`, instructions: "Move with control, keep your core braced, and use a range of motion you can own.", defaultSets: 3, defaultReps: 10 } }); exerciseIds[slug] = exercise.id; }
  const bench = await prisma.exercise.update({ where: { slug: "barbell-bench-press" }, data: { commonMistakes: "Flaring the elbows, bouncing the bar, and losing shoulder position.", formTips: "Keep your feet planted, brace your core, and lower the bar under control.", safetyNotes: "Use a spotter for challenging sets and stop if you feel sharp pain." } });
  await prisma.exerciseMedia.deleteMany({ where: { exerciseId: bench.id } });
  await prisma.exerciseMedia.create({ data: { exerciseId: bench.id, type: "IMAGE", url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80", title: "Barbell bench press demonstration", description: "A controlled barbell press in a gym setting.", source: "Unsplash", sourceUrl: "https://unsplash.com/" , isPrimary: true } });
  await prisma.exerciseMedia.create({ data: { exerciseId: bench.id, type: "TUTORIAL", url: "https://www.youtube.com/watch?v=4Y2ZdHCOXok", title: "How to properly bench press", description: "External tutorial link. The original creator retains all rights.", source: "YouTube", sourceUrl: "https://www.youtube.com/watch?v=4Y2ZdHCOXok", sortOrder: 1 } });
  await prisma.exerciseInstruction.deleteMany({ where: { exerciseId: bench.id } });
  await prisma.exerciseInstruction.createMany({ data: ["Set your feet firmly and brace your core.", "Grip the bar slightly wider than shoulder width.", "Lower the bar toward your mid chest with control.", "Press evenly until your arms are straight."].map((body, index) => ({ exerciseId: bench.id, step: index + 1, body })) });
  const tutorials = [
    ["goblet-squat", "CkFzgR55gho", "How to perform a dumbbell goblet squat"],
    ["lat-pulldown", "8UOC7kb5lyE", "Lat pulldown technique tutorial"],
    ["romanian-deadlift", "5rIqP63yWFg", "Romanian deadlift tutorial"],
    ["dumbbell-shoulder-press", "guW_ENwLOMI", "How to do dumbbell shoulder press safely"],
    ["plank-shoulder-tap", "eyeuugrpLYA", "How to do plank shoulder taps"],
    ["walking-lunge", "BYe4uyGF-h4", "Walking lunge technique tip"],
    ["face-pull", "-iPCIEEl_X4", "Face pull technique tutorial"],
  ] as const;
  for (const [slug, videoId, title] of tutorials) {
    const exercise = await prisma.exercise.findUniqueOrThrow({ where: { slug } });
    await prisma.exerciseMedia.deleteMany({ where: { exerciseId: exercise.id } });
    await prisma.exerciseMedia.create({ data: { exerciseId: exercise.id, type: "TUTORIAL", url: `https://www.youtube.com/watch?v=${videoId}`, title, description: "External tutorial link. The original creator retains all rights.", source: "YouTube", sourceUrl: `https://www.youtube.com/watch?v=${videoId}`, isPrimary: true } });
  }
  const program = await prisma.workoutProgram.upsert({ where: { slug: "beginner-strength-foundations" }, update: { published: true }, create: { name: "Strength foundations", slug: "beginner-strength-foundations", description: "A practical four-week introduction to consistent strength training.", goal: "Build strength", difficulty: Difficulty.BEGINNER, duration: 4, weeks: 4, daysPerWeek: 3, equipment: "Home equipment", published: true } });
  const workout = await prisma.workout.upsert({ where: { slug: "strength-foundations-upper" }, update: {}, create: { name: "Upper body strength", slug: "strength-foundations-upper", description: "Build a strong upper body with simple, repeatable movements.", dayNumber: 1, duration: 42, programId: program.id } });
  const plan = [["barbell-bench-press", 1], ["lat-pulldown", 2], ["dumbbell-shoulder-press", 3], ["face-pull", 4]] as const;
  for (const [slug, order] of plan) await prisma.workoutExercise.upsert({ where: { workoutId_order: { workoutId: workout.id, order } }, update: {}, create: { workoutId: workout.id, exerciseId: exerciseIds[slug], order, sets: 3, reps: 10, restSeconds: 90 } });
  const additionalWorkouts = [
    { name: "Foundation full body", slug: "strength-foundations-full-body", duration: 30, plan: [["goblet-squat", 1], ["plank-shoulder-tap", 2], ["walking-lunge", 3]] },
    { name: "Lower body power", slug: "strength-foundations-lower", duration: 48, plan: [["goblet-squat", 1], ["romanian-deadlift", 2], ["walking-lunge", 3]] },
    { name: "Conditioning circuit", slug: "strength-foundations-conditioning", duration: 35, plan: [["walking-lunge", 1], ["plank-shoulder-tap", 2], ["goblet-squat", 3]] },
  ] as const;
  for (const [index, item] of additionalWorkouts.entries()) {
    const additionalWorkout = await prisma.workout.upsert({ where: { slug: item.slug }, update: { name: item.name, duration: item.duration, programId: program.id }, create: { name: item.name, slug: item.slug, description: `A focused ${item.name.toLowerCase()} session.`, dayNumber: index + 2, duration: item.duration, programId: program.id } });
    for (const [slug, order] of item.plan) await prisma.workoutExercise.upsert({ where: { workoutId_order: { workoutId: additionalWorkout.id, order } }, update: {}, create: { workoutId: additionalWorkout.id, exerciseId: exerciseIds[slug], order, sets: 3, reps: 10, restSeconds: 90 } });
  }
  await prisma.userWorkoutPlan.upsert({ where: { userId_programId: { userId: demoUser.id, programId: program.id } }, update: {}, create: { userId: demoUser.id, programId: program.id } });
  console.log("Seeded FORM demo data for alex@form.training / form-demo-password");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
