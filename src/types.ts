export type ArticleType = "live" | "backtest";
export type ArticleStatus = "draft" | "published" | "archived";
export type SectionTitleSize = "h2" | "h3" | "h4";
export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "won" | "lost" | "breakeven" | "cancelled";
export type RiskMode = "amount" | "percent";

export type Media = {
  id: string;
  articleId: string;
  sectionId: string | null;
  storageKey: string;
  url: string | null;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
};

export type ArticleSection = {
  id: string;
  articleId: string;
  position: number;
  title: string | null;
  titleSize: SectionTitleSize;
  content: string | null;
  media: Media[];
  createdAt: string;
  updatedAt: string;
};

export type TradeEvent = {
  id: string;
  tradeId: string;
  position: number;
  eventTime: string;
  title: string;
  description: string | null;
  createdAt: string;
};

export type Trade = {
  id: string;
  articleId: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  resultR: number | null;
  riskMode: RiskMode | null;
  riskValue: number | null;
  pnlUsd: number | null;
  status: TradeStatus;
  openedAt: string | null;
  closedAt: string | null;
  events: TradeEvent[];
  createdAt: string;
  updatedAt: string;
};

export type Article = {
  id: string;
  type: ArticleType;
  title: string;
  slug: string;
  excerpt: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: ArticleSection[];
  trade: Trade | null;
  coverMedia: Media | null;
};

export type ArticleListItem = {
  id: string;
  type: ArticleType;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  // Trade fields (live)
  symbol: string | null;
  resultR: number | null;
  pnlUsd: number | null;
  riskMode: RiskMode | null;
  riskValue: number | null;
  tradeStatus: TradeStatus | null;
  openedAt: string | null;
  closedAt: string | null;
  coverUrl?: string | null;
};

export type AdminStats = {
  publishedTrades: number;
  totalR: number;
  winRate: number | null;
  drafts: number;
  liveCount: number;
};

// Input types for create/update
export type SectionInput = {
  id?: string;
  title?: string | null;
  titleSize?: SectionTitleSize;
  content?: string | null;
  position?: number;
};

export type TradeEventInput = {
  title: string;
  description?: string | null;
  eventTime: string;
  position?: number;
};

export type TradeInput = {
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  resultR?: number | null;
  riskMode?: RiskMode | null;
  riskValue?: number | null;
  pnlUsd?: number | null;
  status: TradeStatus;
  openedAt?: string | null;
  closedAt?: string | null;
  events?: TradeEventInput[];
};

export type ArticleInput = {
  type: ArticleType;
  title: string;
  slug: string;
  excerpt?: string | null;
  status?: ArticleStatus;
  publishedAt?: string | null;
  sections?: SectionInput[];
  trade?: TradeInput | null;
};
