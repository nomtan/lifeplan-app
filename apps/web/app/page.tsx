const plans = [
  { name: "現在プラン", value: "4,820万円" },
  { name: "FIREプラン", value: "6,120万円" },
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Lifeplan</p>
          <h1>人生のお金を、見える形に。</h1>
          <p className="lead">現在の資産とライフプランをまとめて確認できます。</p>
        </div>
        <button className="primary">実績を入力</button>
      </header>

      <section className="stats">
        <article><span>現金</span><strong>320万円</strong></article>
        <article><span>投資資産</span><strong>680万円</strong></article>
        <article><span>負債</span><strong>1,850万円</strong></article>
        <article><span>純資産</span><strong>-850万円</strong></article>
      </section>

      <section>
        <div className="sectionTitle">
          <h2>ライフプラン</h2>
          <button className="secondary">新規プラン</button>
        </div>
        <div className="planGrid">
          {plans.map((plan) => (
            <article className="planCard" key={plan.name}>
              <span>プラン</span>
              <h3>{plan.name}</h3>
              <p>最終資産</p>
              <strong>{plan.value}</strong>
              <button className="linkButton">プランを見る →</button>
            </article>
          ))}
          <article className="compareCard">
            <span>比較</span>
            <h3>全プランを比較</h3>
            <p>資産合計の推移をひとつのグラフで比較します。</p>
            <button className="linkButton">比較を見る →</button>
          </article>
        </div>
      </section>
    </main>
  );
}
