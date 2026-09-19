import { HomeSearch } from "@/components/home-search";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 sm:px-10">
      <header className="flex items-center justify-between border-b border-stone-200 py-7">
        <span className="text-2xl font-semibold tracking-tight">HemScope</span>
        <span className="text-sm text-stone-600">Gothenburg, Sweden</span>
      </header>
      <main className="flex flex-1 flex-col justify-center py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold tracking-wide text-teal-800">
            Gothenburg property intelligence
          </p>
          <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
            A clearer picture of your next home.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            Describe the home you&apos;re looking for. HemScope helps you discover
            properties, understand their estimated monthly cost, and compare the
            trade-offs.
          </p>
        </div>
        <HomeSearch />
        <p className="mt-6 max-w-2xl text-sm leading-6 text-stone-600">
          Start with what matters to you: your budget, number of rooms, or being
          close to shops and public transport.
        </p>
      </main>
      <footer className="border-t border-stone-200 py-6 text-sm text-stone-600">
        Your home. Your priorities. A more informed decision.
      </footer>
    </div>
  );
}
