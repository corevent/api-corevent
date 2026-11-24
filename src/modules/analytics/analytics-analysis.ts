export const ANALYTICS_ANALYSES = ['eda', 'apriori', 'kmeans', 'classification'] as const

export type AnalyticsAnalysis = (typeof ANALYTICS_ANALYSES)[number]

export const ANALYTICS_ARTIFACT_FILES: Record<AnalyticsAnalysis, string> = {
  eda: 'eda.json',
  apriori: 'apriori.json',
  kmeans: 'kmeans.json',
  classification: 'classification.json',
}
