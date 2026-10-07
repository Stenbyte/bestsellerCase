import type { Partner, Ticket } from '@recolour/core'
import { isUploadedImagePath } from './uploads.js'

export const SEED_PARTNERS: Partner[] = [
  { id: 'partner-colorlab', name: 'ColorLab' },
  { id: 'partner-retouchco', name: 'RetouchCo' },
  { id: 'partner-pixel', name: 'PixelPartner' },
]

export const SEED_IMAGE_PATHS = [
  'Ticket 1/15377489_5081878_001.jpg',
  'Ticket 1/15377489_5081878_002.jpg',
  'Ticket 1/15377489_5081878_007.jpg',
  'Ticket 1/Block Libre.jpg',
  'Ticket 2/15377486_5078866_001.jpg',
  'Ticket 2/15377486_5078866_002.jpg',
  'Ticket 2/15377486_5078866_007.jpg',
  'Ticket 2/DOTS CLOUD DANCER.jpg',
  'Ticket 3/15377488_5078869_001.jpg',
  'Ticket 3/15377488_5078869_002.jpg',
  'Ticket 3/15377488_5078869_007.jpg',
  'Ticket 3/DOTS CLOUD DANCER.jpg',
  'Ticket 4/15377522_5081887_001.jpg',
  'Ticket 4/15377522_5081887_002.jpg',
  'Ticket 4/15377522_5081887_007.jpg',
  'Ticket 4/Block Libre.jpg',
] as const

export type SeedImagePath = (typeof SEED_IMAGE_PATHS)[number]

const SEED_IMAGE_SET = new Set<string>(SEED_IMAGE_PATHS)

export function isAllowedImagePath(imagePath: string): boolean {
  if (imagePath.includes('..') || pathIsAbsolute(imagePath)) return false
  return SEED_IMAGE_SET.has(imagePath) || isUploadedImagePath(imagePath)
}

function pathIsAbsolute(imagePath: string): boolean {
  return imagePath.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(imagePath)
}

export function buildSeedTickets(now = new Date()): Ticket[] {
  const t = (offsetMinutes: number) =>
    new Date(now.getTime() - offsetMinutes * 60_000).toISOString()

  return [
    {
      id: 'ticket-1',
      photoId: '15377489',
      style: 'Granita / Fuchsia Fedora + Block Libre',
      priority: 'high',
      partnerId: 'partner-colorlab',
      status: 'pending',
      pantoneNotes:
        'Keep one clipping path. Pantone: Granita solid; Fuchsia Fedora with AOP Block Libre.',
      imagePaths: [
        'Ticket 1/15377489_5081878_001.jpg',
        'Ticket 1/15377489_5081878_002.jpg',
        'Ticket 1/15377489_5081878_007.jpg',
        'Ticket 1/Block Libre.jpg',
      ],
      createdAt: t(180),
      updatedAt: t(180),
      createdBy: 'user-operator',
    },
    {
      id: 'ticket-2',
      photoId: '15377486',
      style: 'Night Sky AOP + Hedge Green / Navy Blazer',
      priority: 'medium',
      partnerId: 'partner-retouchco',
      status: 'in_progress',
      pantoneNotes:
        'Keep one clipping path. Night Sky with AOP White Dots (DOTS CLOUD DANCER, night sky not black); Hedge Green solid; Navy Blazer solid.',
      imagePaths: [
        'Ticket 2/15377486_5078866_001.jpg',
        'Ticket 2/15377486_5078866_002.jpg',
        'Ticket 2/15377486_5078866_007.jpg',
        'Ticket 2/DOTS CLOUD DANCER.jpg',
      ],
      partnerReceiptId: 'rcpt-seed-2',
      createdAt: t(120),
      updatedAt: t(30),
      createdBy: 'user-operator',
    },
    {
      id: 'ticket-3',
      photoId: '15377488',
      style: 'Hedge Green / Navy Blazer / Night Sky AOP',
      priority: 'medium',
      partnerId: 'partner-pixel',
      status: 'completed',
      pantoneNotes:
        'Keep one clipping path. Hedge Green solid; Navy Blazer solid; Night Sky with AOP White Dots.',
      imagePaths: [
        'Ticket 3/15377488_5078869_001.jpg',
        'Ticket 3/15377488_5078869_002.jpg',
        'Ticket 3/15377488_5078869_007.jpg',
        'Ticket 3/DOTS CLOUD DANCER.jpg',
      ],
      partnerReceiptId: 'rcpt-seed-3',
      createdAt: t(90),
      updatedAt: t(10),
      createdBy: 'user-manager',
    },
    {
      id: 'ticket-4',
      photoId: '15377522',
      style: 'Granita / Fuchsia Fedora + Block Libre',
      priority: 'low',
      partnerId: 'partner-colorlab',
      status: 'sent',
      pantoneNotes:
        'Keep one clipping path. Pantone: Granita solid; Fuchsia Fedora with AOP Block Libre.',
      imagePaths: [
        'Ticket 4/15377522_5081887_001.jpg',
        'Ticket 4/15377522_5081887_002.jpg',
        'Ticket 4/15377522_5081887_007.jpg',
        'Ticket 4/Block Libre.jpg',
      ],
      partnerReceiptId: 'rcpt-seed-4',
      createdAt: t(60),
      updatedAt: t(45),
      createdBy: 'user-operator',
    },
  ]
}
