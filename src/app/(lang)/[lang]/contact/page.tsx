export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">お問い合わせ</h1>
      <p className="text-sm text-slate-600">
        AIの回答品質に関する通報、スポンサーに関するお問い合わせ、学生ライター応募はフォームまたは
        メールでご連絡ください。
      </p>
      <ul className="space-y-2 text-sm text-slate-700">
        <li>メール: info@voynexus.com</li>
      </ul>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">フォームから送る</h2>
        <p className="mt-1 text-xs text-slate-500">
          送信後に受付メールが届かない場合は、迷惑メールフォルダをご確認のうえ上記アドレスへ直接ご連絡ください。
        </p>
        <form
          className="mt-4 space-y-4"
          action="mailto:info@voynexus.com"
          method="POST"
          encType="text/plain"
        >
          <label className="block text-sm text-slate-600">
            お名前
            <input
              type="text"
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </label>
          <label className="block text-sm text-slate-600">
            メールアドレス
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </label>
          <label className="block text-sm text-slate-600">
            件名
            <select
              name="topic"
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
              defaultValue="general"
            >
              <option value="general">一般お問い合わせ</option>
              <option value="sponsor">スポンサー/タイアップ</option>
              <option value="quality">AI品質レポート</option>
              <option value="writer">学生ライター応募</option>
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            内容
            <textarea
              name="message"
              rows={6}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            送信する
          </button>
        </form>
      </div>
    </div>
  );
}
