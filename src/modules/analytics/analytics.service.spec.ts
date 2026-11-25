import { NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { AnalyticsService } from '~/modules/analytics/analytics.service'
import { AnalyticsArtifactsReader } from '~/modules/analytics/analytics-artifacts.reader'

const edaPayload = {
  source: 'synthetic',
  generatedAt: '2026-11-24T15:00:00.000Z',
  tableCounts: { users: 10, events: 2 },
  eventsByCategory: [{ category: 'tech', count: 2 }],
  ordersByStatus: [{ status: 'paid', count: 5 }],
  transactionsSummary: {
    nTransactions: 8,
    avgCategoriesPerUser: 1.5,
    categoryUserCounts: [{ category: 'tech', users: 4 }],
  },
  userFeatureStats: {
    age: { count: 10, mean: 30, std: 5, min: 20, p25: 25, p50: 30, p75: 35, max: 40 },
  },
}

describe('AnalyticsService', () => {
  let reader: jest.Mocked<AnalyticsArtifactsReader>
  let service: AnalyticsService

  beforeEach(() => {
    reader = {
      readJson: jest.fn(),
    }
    service = new AnalyticsService(reader)
  })

  it('returns wrapped EDA payload', async () => {
    reader.readJson.mockResolvedValue(edaPayload)
    await expect(service.getEda()).resolves.toEqual({ data: edaPayload })
    expect(reader.readJson).toHaveBeenCalledWith('eda')
  })

  it('returns wrapped Apriori payload', async () => {
    const payload = {
      source: 'synthetic',
      generatedAt: '2026-11-24T15:00:00.000Z',
      meta: { nTransactions: 8, minSupport: 0.05, minConfidence: 0.3, nItemsets: 1, nRules: 1 },
      frequentItemsets: [{ items: ['music'], support: 0.5 }],
      rules: [
        {
          antecedents: ['music'],
          consequents: ['gastronomy'],
          antecedentSupport: 0.5,
          consequentSupport: 0.4,
          support: 0.3,
          confidence: 0.6,
          lift: 1.5,
        },
      ],
    }
    reader.readJson.mockResolvedValue(payload)
    await expect(service.getApriori()).resolves.toEqual({ data: payload })
    expect(reader.readJson).toHaveBeenCalledWith('apriori')
  })

  it('returns wrapped K-Means payload', async () => {
    const payload = {
      source: 'synthetic',
      generatedAt: '2026-11-24T15:00:00.000Z',
      metrics: { nClusters: 2, inertia: 10, silhouette: 0.2 },
      kSelection: { bestK: 2, candidates: [{ k: 2, inertia: 10, silhouette: 0.2 }] },
      clusters: [
        {
          clusterId: 0,
          size: 5,
          share: 0.5,
          centroid: { age: 30, categories: { tech: 1 } },
        },
      ],
      pcaSample: { explainedVarianceRatio: [0.5, 0.2], points: [{ x: 0.1, y: 0.2, clusterId: 0 }] },
    }
    reader.readJson.mockResolvedValue(payload)
    await expect(service.getKmeans()).resolves.toEqual({ data: payload })
    expect(reader.readJson).toHaveBeenCalledWith('kmeans')
  })

  it('returns wrapped classification payload', async () => {
    const payload = {
      source: 'synthetic',
      generatedAt: '2026-11-24T15:00:00.000Z',
      nSamples: 10,
      nTrain: 7,
      nTest: 3,
      classBalance: { '0': 0.4, '1': 0.6 },
      featureColumns: ['age'],
      models: {
        randomForest: {
          accuracy: 0.5,
          precision: 0.5,
          recall: 0.5,
          f1: 0.5,
          confusionMatrix: [
            [1, 1],
            [1, 1],
          ],
          classificationReport: {},
          featureImportances: [{ feature: 'age', importance: 1 }],
        },
        mlp: {
          accuracy: 0.6,
          precision: 0.6,
          recall: 0.6,
          f1: 0.6,
          confusionMatrix: [
            [1, 0],
            [1, 1],
          ],
          classificationReport: {},
        },
      },
    }
    reader.readJson.mockResolvedValue(payload)
    await expect(service.getClassification()).resolves.toEqual({ data: payload })
    expect(reader.readJson).toHaveBeenCalledWith('classification')
  })

  it('propagates NotFoundException from the reader', async () => {
    reader.readJson.mockRejectedValue(new NotFoundException('missing'))
    await expect(service.getEda()).rejects.toBeInstanceOf(NotFoundException)
  })

  it('rejects non-object payloads', async () => {
    reader.readJson.mockResolvedValue(['not', 'an', 'object'])
    await expect(service.getEda()).rejects.toBeInstanceOf(ServiceUnavailableException)
  })
})
