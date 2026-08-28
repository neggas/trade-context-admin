import ArticleEditor from "components/ArticleEditor";

export default function EditBacktestPage({
  params,
}: {
  params: { id: string };
}) {
  return <ArticleEditor type="backtest" articleId={params.id} />;
}
