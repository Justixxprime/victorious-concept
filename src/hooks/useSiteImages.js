import { useSiteSettings } from './useSiteSettings'
import { siteImages as defaultSiteImages, categoryImages as defaultCategoryImages } from '../data/siteImages'

/**
 * Returns { siteImages, categoryImages } merging any admin-set overrides
 * (stored under the 'site_images' site_settings key, shaped as
 * { siteImages: { key: url }, categoryImages: { key: url } }) on top of the
 * static defaults in src/data/siteImages.js. Because `value` from
 * useSiteSettings starts out null before the fetch resolves, this always
 * returns the static defaults first, then the merged result once overrides
 * load, so no image ever flashes blank or missing.
 */
export function useSiteImages() {
  const { value } = useSiteSettings('site_images')
  const overrides = value || {}

  return {
    siteImages: { ...defaultSiteImages, ...(overrides.siteImages || {}) },
    categoryImages: { ...defaultCategoryImages, ...(overrides.categoryImages || {}) },
  }
}
