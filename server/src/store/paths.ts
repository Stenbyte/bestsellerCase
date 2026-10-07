import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export const SEED_ROOT = path.resolve(here, '../../../recolour-case')
export const UPLOAD_ROOT = path.resolve(here, '../../data/uploads')
