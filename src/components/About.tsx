interface AboutContent {
  title: string;
  text: string;
  values: { name: string; icon: string; description: string }[];
}

export default function About({ content }: { content: AboutContent }) {
  const paragraphs = content.text.split("\n\n").filter(Boolean);

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="about-heading"
          className="mb-12 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          {content.title}
        </h2>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-lg leading-relaxed text-gray-200">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {content.values.map((value) => {
              return (
                <div
                  key={value.name}
                  className="rounded-xl border border-olive/30 bg-dark-card p-6 text-center transition-colors hover:border-olive"
                >
                  <span className="mb-3 block text-3xl" role="img" aria-hidden="true">
                    {value.icon}
                  </span>
                  <h3 className="mb-2 font-bold text-sand">{value.name}</h3>
                  {value.description && <p className="text-sm text-gray-200">{value.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
