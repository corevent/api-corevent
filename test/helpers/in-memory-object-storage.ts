interface SignedUrlConfig {
  action: 'read' | 'write'
  contentType?: string
}

interface StoredObject {
  uploaded: boolean
  deleted: boolean
}

export class InMemoryObjectStorage {
  private bucketName = ''
  private readonly objects = new Map<string, StoredObject>()

  bucket(bucketName: string): { file: (key: string) => InMemoryStorageFile } {
    this.bucketName = bucketName
    return {
      file: (key: string) => this.file(key),
    }
  }

  markUploaded(key: string): void {
    this.objects.set(key, { uploaded: true, deleted: false })
  }

  wasDeleted(key: string): boolean {
    return this.objects.get(key)?.deleted === true
  }

  readUrl(key: string): string {
    return `https://storage.test/read?bucket=${encodeURIComponent(this.bucketName)}&key=${encodeURIComponent(key)}`
  }

  writeUrl(key: string, contentType: string): string {
    const bucket = encodeURIComponent(this.bucketName)
    const objectKey = encodeURIComponent(key)
    const type = encodeURIComponent(contentType)
    return `https://storage.test/write?bucket=${bucket}&key=${objectKey}&contentType=${type}`
  }

  private file(key: string): InMemoryStorageFile {
    return {
      getSignedUrl: (config: SignedUrlConfig) => Promise.resolve([this.signedUrl(key, config)]),
      exists: () => Promise.resolve([this.objects.get(key)?.uploaded === true]),
      delete: () => {
        this.objects.set(key, { uploaded: false, deleted: true })
        return Promise.resolve()
      },
    }
  }

  private signedUrl(key: string, config: SignedUrlConfig): string {
    if (config.action === 'write') {
      return this.writeUrl(key, config.contentType ?? '')
    }
    return this.readUrl(key)
  }
}

interface InMemoryStorageFile {
  getSignedUrl: (config: SignedUrlConfig) => Promise<[string]>
  exists: () => Promise<[boolean]>
  delete: () => Promise<void>
}
