import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { useBusinessSettings } from '../../context/BusinessSettingsContext'
import { useSiteSettings } from '../../hooks/useSiteSettings'

export default function AdminBusinessTab() {
  const { showToast } = useToast()
  const businessSettings = useBusinessSettings()
  const [businessForm, setBusinessForm] = useState(null)
  const [savingBusiness, setSavingBusiness] = useState(false)

  const { value: referralSetting, updateSetting: updateReferralSetting } = useSiteSettings('referral_program')
  // Treated as enabled until an admin explicitly turns it off — this
  // preserves the feature's current live behavior for anyone who hasn't
  // touched this toggle yet, rather than silently disabling it.
  const referralEnabled = referralSetting?.enabled !== false

  async function toggleReferralProgram() {
    await updateReferralSetting({ enabled: !referralEnabled })
    showToast(referralEnabled ? 'Referral program turned off' : 'Referral program turned on', 'success')
  }

  useEffect(() => {
    if (!businessSettings.loading && !businessForm) {
      setBusinessForm({
        whatsappNumber: businessSettings.whatsappNumber,
        bankAccountName: businessSettings.bankAccountName,
        bankAccountNumber: businessSettings.bankAccountNumber,
        bankName: businessSettings.bankName,
      })
    }
  }, [businessSettings.loading])

  async function saveBusinessSettings() {
    setSavingBusiness(true)
    await businessSettings.updateSettings(businessForm)
    setSavingBusiness(false)
    showToast('Business info updated', 'success')
  }

  if (!businessForm) return null

  return (
    <div className="max-w-md flex flex-col gap-6">
      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">WhatsApp Number</h2>
        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
          Used across the whole site: floating button, checkout, product questions, order help. Digits only, with country code, no + or spaces (e.g. 2348122470435).
        </p>
        <input
          type="text"
          value={businessForm.whatsappNumber}
          onChange={(e) => setBusinessForm({ ...businessForm, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
          className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
        />
      </div>

      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Bank Transfer Details</h2>
        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
          Shown to customers who choose "Bank Transfer" at checkout.
        </p>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Account name"
            value={businessForm.bankAccountName}
            onChange={(e) => setBusinessForm({ ...businessForm, bankAccountName: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
          />
          <input
            type="text"
            placeholder="Account number"
            value={businessForm.bankAccountNumber}
            onChange={(e) => setBusinessForm({ ...businessForm, bankAccountNumber: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
          />
          <input
            type="text"
            placeholder="Bank name"
            value={businessForm.bankName}
            onChange={(e) => setBusinessForm({ ...businessForm, bankName: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Referral Program</h2>
        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
          When on, every signed-in customer gets a personal referral code on their Account page to
          share. Turning this off hides that card for everyone going forward. Codes already shared
          keep working as normal discount codes either way, since they're just regular coupons
          under the hood.
        </p>
        <button
          onClick={toggleReferralProgram}
          className={`text-sm font-sans px-4 py-2 rounded-full transition-colors ${
            referralEnabled ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-espresso/50 dark:text-cream/50'
          }`}
        >
          {referralEnabled ? 'On, tap to turn off' : 'Off, tap to turn on'}
        </button>
      </div>

      <button
        onClick={saveBusinessSettings}
        disabled={savingBusiness}
        className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
      >
        {savingBusiness ? 'Saving...' : 'Save Business Info'}
      </button>
    </div>
  )
}