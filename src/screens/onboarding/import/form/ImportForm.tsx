import { useWalletStore } from '@/src/store/walletStore'

const ImportForm = ({ onNext }: ImportFormProps) => {
  const importWallet = useWalletStore(state => state.importWallet)
  const isSyncing = useWalletStore(state => state.isSyncing)
  
  const handleImport = async () => {
    setIsSubmitting(true)
    setError('')
    
    try {
      const cleanSeedPhrase = seedPhrase.trim().replace(/\s+/g, ' ')
      
      const success = await importWallet(cleanSeedPhrase)
      
      if (success) {
        onNext()
      } else {
        setError('Failed to import wallet. Please try again.')
      }
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while importing your wallet.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }
} 