export function HomeSearch() {
  return (
    <section aria-labelledby="home-search-label" className="mt-10 max-w-3xl">
      <label id="home-search-label" htmlFor="home-description" className="mb-3 block text-sm font-semibold">
        What does home look like to you?
      </label>
      <div className="rounded-2xl border border-stone-300 bg-white p-4 shadow-sm sm:p-5">
        <textarea
          id="home-description"
          name="description"
          rows={3}
          placeholder="Tell us what kind of home you're looking for..."
          aria-describedby="search-availability"
          className="block min-h-28 w-full resize-y rounded-lg p-2 text-base leading-7 placeholder:text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        />
        <div className="mt-4 flex flex-col gap-4 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p id="search-availability" className="text-sm text-stone-500">
            Search is coming soon. Describe your ideal home here for now.
          </p>
          <button type="button" disabled className="rounded-xl bg-teal-800 px-7 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
