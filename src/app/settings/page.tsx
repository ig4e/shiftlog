import { SettingsForm } from "./form";

export default async function Home() {
  return (
    <main className="mt-5 flex flex-col gap-4">
      <SettingsForm />
    </main>
  );
}
