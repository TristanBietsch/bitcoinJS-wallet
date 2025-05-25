declare namespace About {
  interface TechnicalDetailsData {
    network: string
    platform: string
    version: string
  }

  interface ReleaseNotesData {
    version: string
    date: string
    bulletPoints: string[]
    releaseHistoryUrl: string
  }
} 