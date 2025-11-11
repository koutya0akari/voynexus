export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">お問い合わせ</h1>
      <p className="text-sm text-slate-600">
        AIの回答品質に関する通報、スポンサーに関するお問い合わせ、学生ライター応募は以下の連絡先までお願いいたします。
      </p>
      <ul className="space-y-2 text-sm text-slate-700">
  <li>メール: info@voynexus.com</li>
  <li>スポンサー: sponsor@voynexus.com</li>
  <li>学生ライター: students@voynexus.com</li>
      </ul>
    </div>
  );
}
