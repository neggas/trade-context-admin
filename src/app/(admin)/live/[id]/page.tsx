import ArticleEditor from "components/ArticleEditor";

export default function EditLiveTradePage({
  params,
}: {
  params: { id: string };
}) {
  return <ArticleEditor type="live" articleId={params.id} />;
}
