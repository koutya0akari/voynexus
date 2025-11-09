type Props = {
  title: string;
  sections: { heading: string; body: string }[];
};

export function SimpleDoc({ title, sections }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <p className="text-sm uppercase text-slate-500">Compliance</p>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      </header>
      <div className="space-y-4 text-sm text-slate-700">
        {sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
            <p className="mt-2 whitespace-pre-wrap">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
