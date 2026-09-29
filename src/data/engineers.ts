/**
 * EVLab — The Engineers directory.
 *
 * A small registry of engineer profiles shown on /engineers. Each entry with
 * `profilePath` set links to a full in-app profile page (built the same way
 * as /engineers/ayatullah-imani — a standalone portfolio ported in under
 * src/engineers/<slug>/ and routed from App.tsx). Entries without a
 * `profilePath` render as a "coming soon" card so the directory can list
 * engineers before their full profile page is built.
 */

import ayatullahAvatar from '@/engineers/ayatullah-imani/assets/images/avatar_ayatullah_imani_1790644469052.jpg'

export interface EngineerProfile {
  slug: string
  name: string
  title: string
  employer?: string
  location?: string
  avatar?: string
  summary: string
  skills: string[]
  /** In-app route to the full profile page, if one has been built yet. */
  profilePath?: string
}

export const ENGINEERS: EngineerProfile[] = [
  {
    slug: 'ayatullah-imani',
    name: 'Md. Ayatullah Imani',
    title: 'CAD Expert for Water Network Design & Hydraulic Modeller',
    employer: 'Institute of Water Modelling (IWM)',
    location: 'Dhaka, Bangladesh',
    avatar: ayatullahAvatar,
    summary:
      'CAD Expert at IWM since March 2022, specializing in AutoCAD, Civil 3D, WaterGEMS hydraulic network modeling, and ArcGIS/QGIS across mega water-supply projects — including the Padma (Jashaldia) 2000mm transmission main, Khulna WASA Phase-2 WTPs, DWSNIP DMAs, and UNICEF refugee-camp networks.',
    skills: ['AutoCAD', 'Civil 3D', 'WaterGEMS', 'ArcGIS / QGIS', 'Water Networks'],
    profilePath: '/engineers/ayatullah-imani',
  },
]
