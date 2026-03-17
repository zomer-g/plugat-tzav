export default function Contact() {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@plugat-tzav.org";

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2
          id="contact-heading"
          className="mb-4 text-3xl font-bold text-sand md:text-4xl"
        >
          צור קשר
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-gray-200">
          רוצים לדעת עוד? לתרום? להצטרף? אנחנו כאן בשבילכם.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-slate-mil/20 bg-dark-card p-8">
            <div className="mb-4 text-3xl" role="img" aria-hidden="true">📧</div>
            <h3 className="mb-2 font-bold text-sand">אימייל</h3>
            <a
              href={`mailto:${email}`}
              className="text-gray-200 transition-colors hover:text-sand"
            >
              {email}
            </a>
          </div>

          <div className="rounded-xl border border-slate-mil/20 bg-dark-card p-8">
            <div className="mb-4 text-3xl" role="img" aria-hidden="true">📱</div>
            <h3 className="mb-2 font-bold text-sand">טלפון</h3>
            <p className="text-gray-200">ניתן ליצור קשר דרך האימייל</p>
          </div>

          <div className="rounded-xl border border-slate-mil/20 bg-dark-card p-8">
            <div className="mb-4 text-3xl" role="img" aria-hidden="true">📍</div>
            <h3 className="mb-2 font-bold text-sand">מיקום</h3>
            <p className="text-gray-200">ישראל</p>
          </div>
        </div>
      </div>
    </section>
  );
}
